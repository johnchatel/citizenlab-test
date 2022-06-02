# frozen_string_literal: true

# Contains settings & configuration data of the homepage.
# == Schema Information
#
# Table name: home_pages
#
#  id                                       :uuid             not null, primary key
#  top_info_section_enabled                 :boolean          default(TRUE), not null
#  top_info_section_multiloc                :jsonb            not null
#  bottom_info_section_enabled              :boolean          default(TRUE), not null
#  bottom_info_section_multiloc             :jsonb            not null
#  events_enabled                           :boolean          default(FALSE), not null
#  projects_enabled                         :boolean          default(TRUE), not null
#  projects_header                          :jsonb            not null
#  banner_avatars_enabled                   :boolean          default(TRUE), not null
#  banner_enabled                           :boolean          default(TRUE), not null
#  banner_layout                            :string           default("full_width_banner_layout"), not null
#  banner_signed_in_header                  :jsonb            not null
#  banner_signed_in_text                    :jsonb            not null
#  banner_signed_in_type                    :string           default("no_button"), not null
#  banner_signed_in_url                     :string
#  banner_signed_out_header                 :jsonb            not null
#  banner_signed_out_subheader              :jsonb            not null
#  banner_signed_out_header_overlay_color   :string
#  banner_signed_out_header_overlay_opacity :integer
#  banner_signed_out_text                   :jsonb            not null
#  banner_signed_out_type                   :string           default("sign_up_button"), not null
#  banner_signed_out_url                    :string
#  created_at                               :datetime         not null
#  updated_at                               :datetime         not null
#
class HomePage < ApplicationRecord
end
