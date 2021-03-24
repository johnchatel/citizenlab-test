# frozen_string_literal: true

class Permission < ApplicationRecord
  PERMITTED_BIES = %w[everyone users groups admins_moderators].freeze

  DENIED_REASONS = {
    not_verified: 'not_verified',
    not_permitted: 'not_permitted',
    not_signed_in: 'not_signed_in'
  }.freeze

  belongs_to :permission_scope, polymorphic: true, optional: true
  has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :action, presence: true, inclusion: { in: :available_actions }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: ->(_r) { PermissionsService.scope_types } }

  before_validation :set_permitted_by, on: :create

  scope :for_user, lambda { |user|
    if user&.admin?
      all
    elsif user
      permissions_for_everyone_ids = where(permitted_by: %w[everyone users]).ids
      moderating_context_ids = ParticipationContextService.new.moderating_participation_context_ids(user)
      moderating_permissions_ids = where(permission_scope_id: moderating_context_ids).ids
      group_permission_ids = joins(:groups_permissions)
                               .where(permitted_by: 'groups')
                               .where(groups_permissions: { group_id: user.group_ids }).ids
      where(id: (permissions_for_everyone_ids + moderating_permissions_ids + group_permission_ids).uniq)
    else
      where(permitted_by: 'everyone')
    end
  }

  def granted_to?(user)
    !denied?(user)
  end

  # @param [User] user
  # @return [String, NilClass] Reason if denied, nil otherwise.
  def denied?(user)
    return if permitted_by == 'everyone'
    return if user&.admin?
    return if moderator?(user)

    reason = case permitted_by
             when 'users' then :not_signed_in unless user
             when 'admins_moderators' then :not_permitted
             when 'groups'
               if requires_verification? && !user&.verified?
                 :not_verified
               elsif user.nil? || (group_ids & user.group_ids).blank?
                 :not_permitted
               end
             else
               raise "Unsupported permitted_by: '#{permitted_by}'."
             end

    DENIED_REASONS[reason]
  end

  def requires_verification?
    return unless permitted_by == 'groups'

    Verification::VerificationService.new.find_verification_group(groups)
  end

  def participation_conditions
    []
  end

  private

  def available_actions
    PermissionsService.actions(permission_scope)
  end

  def set_permitted_by
    self.permitted_by ||= 'users'
  end

  # @param [User] user
  # @return [Boolean]
  def moderator?(user)
    return if user.nil?
    return unless permission_scope.respond_to?(:moderators)

    permission_scope.moderators.include?(user)
  end
end

Permission.prpend_if_ee('SmartGroups::Patches::Permission')
