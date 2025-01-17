# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPages' do
  explanation 'Pages with static HTML content (e.g. privacy policy, cookie policy).'

  let(:json_response) { json_parse response_body }

  before do
    @pages = create_list :static_page, 2
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/static_pages' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of pages (data model pages) per page'
    end

    example_request 'List all static pages' do
      expect(status).to eq 200
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/static_pages/:id' do
    let(:page) { @pages.first }
    let(:id) { page.id }

    example_request 'Get one page by id' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get 'web_api/v1/static_pages/by_slug/:slug' do
    let(:page) { @pages.first }
    let(:slug) { page.slug }

    example_request 'Get one static page by slug' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq page.id
    end

    describe nil do
      let(:slug) { 'unexisting-page' }

      example_request '[error] Get an unexisting static page by slug', document: false do
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    patch 'web_api/v1/static_pages/:id' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :slug, 'The unique slug of the static page. If not given, it will be auto generated'
        parameter :banner_enabled, 'if banner is enabled'
        parameter :banner_layout, 'the specific layout for the banner, one of: full_width_banner_layout two_column_layout two_row_layout'
        parameter :banner_overlay_color, 'color of the banner overlay'
        parameter :banner_overlay_opacity, 'opacity of the banner overlay'
        parameter :banner_cta_button_multiloc, 'multiloc content for the CTA button'
        parameter :banner_cta_button_type, 'type of the CTA, one of: customized_button no_button'
        parameter :banner_cta_button_url, 'url for the CTA'
        parameter :banner_header_multiloc, 'multiloc content for the banner header'
        parameter :banner_subheader_multiloc, 'multiloc content for the banner subheader'
        parameter :top_info_section_enabled, 'if the top info section is enabled'
        parameter :top_info_section_multiloc, 'The top content of the static page, as a multiloc HTML string'
        parameter :files_section_enabled, 'if the files section is enabled'
        parameter :projects_enabled, 'if the projects section is enabled'
        parameter :projects_filter_type, 'the filter used to filter projects for the projects in the projects section, one of: area topics'
        parameter :events_widget_enabled, 'if events section is enabled'
        parameter :bottom_info_section_enabled, 'if the bottom info section is enabled'
        parameter :bottom_info_section_multiloc, 'The bottom content of the static page, as a multiloc HTML string'
        parameter :header_bg, 'image for the header background'
        parameter :pinned_admin_publication_ids, 'the IDs of admin publications that are pinned to the page', type: :array
      end
      ValidationErrorHelper.new.error_fields self, StaticPage

      let(:page) { @pages.first }
      let(:id) { page.id }
      let(:title_multiloc) { { en: 'New title' } }
      let(:top_info_section_multiloc) { { en: 'New top info section text' } }
      let(:bottom_info_section_multiloc) { { en: 'New bottom info section text' } }

      example_request 'Update a static page' do
        assert_status 200

        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to match 'New title'
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc, :en)).to match 'New top info section text'
        expect(json_response.dig(:data, :attributes, :bottom_info_section_multiloc, :en)).to match 'New bottom info section text'
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
      end

      describe 'updating pins' do
        let(:project_one) { create(:project) }
        let(:project_two) { create(:project) }
        let(:pinned_admin_publication_ids) do
          [project_one.admin_publication.id, project_two.admin_publication.id]
        end

        example_request 'set pins to a page' do
          json_response = json_parse(response_body)
          expect(response_status).to eq 200
          expect(json_response.dig(:data, :relationships, :pinned_admin_publications, :data).length).to eq(2)
        end

        context 'when the page has pins already' do
          before do
            projects = create_list(:project, 3)
            page.pinned_admin_publications = projects.map(&:admin_publication)
            page.save!
          end

          example 'Update existing pins to a page', document: false do
            do_request
            json_response = json_parse(response_body)
            expect(response_status).to eq 200
            returned_ids = json_response.dig(:data, :relationships, :pinned_admin_publications, :data).pluck(:id)
            expect(returned_ids).to eq([project_one.admin_publication.id, project_two.admin_publication.id])
          end
        end
      end

      describe 'destroying pins' do
        let(:pinned_admin_publication_ids) do
          []
        end

        context 'when the page has pins already' do
          before do
            projects = create_list(:project, 3)
            page.pinned_admin_publications = projects.map(&:admin_publication)
            page.save!
          end

          example 'Removing existing pins from a page', document: false do
            do_request
            json_response = json_parse(response_body)
            expect(response_status).to eq 200
            expect(json_response.dig(:data, :relationships, :pinned_admin_publications, :data).length).to eq(0)
          end
        end
      end
    end

    post 'web_api/v1/static_pages' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :slug, 'The unique slug of the static page. If not given, it will be auto generated'
        parameter :banner_enabled, 'if banner is enabled'
        parameter :banner_layout, 'the specific layout for the banner, one of: full_width_banner_layout two_column_layout two_row_layout'
        parameter :banner_overlay_color, 'color of the banner overlay'
        parameter :banner_overlay_opacity, 'opacity of the banner overlay'
        parameter :banner_cta_button_multiloc, 'multiloc content for the CTA button'
        parameter :banner_cta_button_type, 'type of the CTA, one of: customized_button no_button'
        parameter :banner_cta_button_url, 'url for the CTA'
        parameter :banner_header_multiloc, 'multiloc content for the banner header'
        parameter :banner_subheader_multiloc, 'multiloc content for the banner subheader'
        parameter :top_info_section_enabled, 'if the top info section is enabled'
        parameter :top_info_section_multiloc, 'The top content of the static page, as a multiloc HTML string'
        parameter :files_section_enabled, 'if the files section is enabled'
        parameter :projects_enabled, 'if the projects section is enabled'
        parameter :projects_filter_type, 'the filter used to filter projects for the projects in the projects section, one of: area topics'
        parameter :events_widget_enabled, 'if events section is enabled'
        parameter :bottom_info_section_enabled, 'if the bottom info section is enabled'
        parameter :bottom_info_section_multiloc, 'The bottom content of the static page, as a multiloc HTML string'
        parameter :header_bg, 'image for the header background'
        parameter :pinned_admin_publication_ids, 'the IDs of admin publications that are pinned to the page', type: :array
      end
      ValidationErrorHelper.new.error_fields self, StaticPage

      let(:page) { build :static_page }
      let(:title_multiloc) { page.title_multiloc }
      let(:top_info_section_multiloc) { page.top_info_section_multiloc }

      example_request 'Create a static page' do
        assert_status 201

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page.title_multiloc
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc).stringify_keys).to match page.top_info_section_multiloc
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
      end

      describe nil do
        let(:slug) { '' }

        example_request '[error] Create an invalid static page', document: false do
          assert_status 422
          expect(json_response).to include_response_error(:slug, 'blank')
        end
      end
    end

    patch 'web_api/v1/static_pages/:id' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :top_info_section_multiloc, 'The content of the static page, as a multiloc HTML string'
        parameter :slug, 'The unique slug of the static page'
      end
      ValidationErrorHelper.new.error_fields self, StaticPage

      let(:id) { @pages.first.id }
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:top_info_section_multiloc) { { 'en' => 'Changed body' } }
      let(:slug) { 'changed-title' }

      example_request 'Update a static page' do
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc, :en)).to eq 'Changed body'
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
      end
    end

    delete 'web_api/v1/static_pages/:id' do
      let(:page) { @pages.first }
      let(:id) { page.id }

      example_request 'Delete a static page' do
        assert_status 200
        expect { page.reload }.to raise_error ActiveRecord::RecordNotFound
      end

      context 'when the page has a code other than \'custom\'' do
        before { page.update!(code: 'faq') }

        example_request 'Delete a static page' do
          assert_status 422
          expect { page.reload }.not_to raise_error ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
