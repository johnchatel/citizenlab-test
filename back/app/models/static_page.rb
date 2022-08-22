# frozen_string_literal: true

# == Schema Information
#
# Table name: static_pages
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb
#  top_info_section_multiloc    :jsonb            not null
#  slug                         :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  code                         :string           not null
#  banner_enabled               :boolean          default(TRUE), not null
#  banner_layout                :string           default("full_width_banner_layout"), not null
#  banner_overlay_color         :string
#  banner_overlay_opacity       :integer
#  banner_cta_button_multiloc   :jsonb            not null
#  banner_cta_button_type       :string           default("no_button"), not null
#  banner_cta_button_url        :string
#  banner_header_multiloc       :jsonb            not null
#  banner_subheader_multiloc    :jsonb            not null
#  top_info_section_enabled     :boolean          default(FALSE), not null
#  files_section_enabled        :boolean          default(FALSE), not null
#  projects_enabled             :boolean          default(FALSE), not null
#  projects_filter_type         :string
#  events_widget_enabled        :boolean          default(FALSE), not null
#  bottom_info_section_enabled  :boolean          default(FALSE), not null
#  bottom_info_section_multiloc :jsonb            not null
#  header_bg                    :string
#
# Indexes
#
#  index_static_pages_on_code  (code)
#  index_static_pages_on_slug  (slug) UNIQUE
#
class StaticPage < ApplicationRecord
  CODES = %w[about terms-and-conditions privacy-policy faq proposals custom].freeze

  has_one :nav_bar_item, dependent: :destroy
  has_many :static_page_files, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :nav_bar_item
  accepts_nested_attributes_for :text_images

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :top_info_section_multiloc, multiloc: { presence: false, html: true }
  validates :slug, presence: true, uniqueness: true
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, if: ->(page) { !page.custom? }

  before_validation :set_code, on: :create
  before_validation :generate_slug, on: :create

  before_validation :strip_title
  before_validation :sanitize_body_multiloc

  def custom?
    code == 'custom'
  end

  private

  def set_code
    self.code ||= 'custom'
  end

  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, title_multiloc.values.first
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      body_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags body_multiloc
    self.body_multiloc = service.linkify_multiloc body_multiloc
  end
end
