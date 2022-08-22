# frozen_string_literal: true

class WebApi::V1::StaticPageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :code, :slug, :created_at, :updated_at

  attribute :top_info_section_multiloc do |object|
    TextImageService.new.render_data_images object, :top_info_section_multiloc
  end

  # This is used to keep supporting default titles for
  # custom NavBarItems that are different from the page
  # title. That way, the frontend can know what the title
  # will be when the page would be added to the navbar (and
  # show this in the list of items to add).
  attribute :nav_bar_item_title_multiloc do |object|
    current_navbaritem_title = object.nav_bar_item&.title_multiloc_with_fallback
    current_navbaritem_title || NavBarItem.new(code: 'custom', static_page: object).title_multiloc_with_fallback
  end

  has_one :nav_bar_item
end
