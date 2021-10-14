# frozen_string_literal: true

class IdeaVotePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def show?
    active? && (owner? || admin?)
  end

  def create?
    return false if !could_modify?

    disabled_reason = participation_context_service.voting_disabled_reason_for_idea_vote record, user
      
    disabled_reason ? raise_not_authorized(disabled_reason) : true
  end

  def up?
    return false if !could_modify?

    reason = changing_vote_disabled? record

    disabled_reason ? raise_not_authorized(disabled_reason) : true
  end

  def down? 
    return false if !could_modify?

    reason = changing_vote_disabled? record

    disabled_reason ? raise_not_authorized(disabled_reason) : true
  end

  def destroy?
    return false if !could_modify?

    disabled_reason = participation_context_service.cancelling_votes_disabled_reason_for_idea idea, user

    disabled_reason ? raise_not_authorized(disabled_reason) : true
  end

  private

  def could_modify?
    active? && owner? && record.votable.present?
  end

  def vote_change_disabled? vote
    reason = participation_context_service.voting_disabled_reason_for_idea_vote vote, user
    if (idea = vote.votable)
      reason ||= participation_context_service.cancelling_votes_disabled_reason_for_idea idea, user
    end
    reason
  end

  def participation_context_service
    @participation_context_service ||= ParticipationContextService.new
  end
end
