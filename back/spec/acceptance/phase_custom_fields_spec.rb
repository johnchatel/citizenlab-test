# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase level Custom Fields' do
  explanation 'Fields in input forms which are customized by the city, scoped to the phases level.'

  before do
    header 'Content-Type', 'application/json'
  end

  describe 'in an ideation phase with form fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase_id) { project.phases.first.id }
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }
    let(:built_in_field_keys) do
      %i[
        title_multiloc
        body_multiloc
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
      ]
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq(built_in_field_keys + [custom_field.key.to_sym])
          end
          expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        else
          expect(json_response).to be_nil
        end
      end
    end
  end

  describe 'in an active phase with form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }
    let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq([custom_field.key.to_sym])
          end
          expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        else
          expect(json_response).to be_nil
        end
      end
    end
  end

  describe 'in an active phase without form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to eq({
          json_schema_multiloc: {
            en: {
              type: 'object',
              additionalProperties: false,
              properties: {}
            },
            'fr-FR': {
              type: 'object',
              additionalProperties: false,
              properties: {}
            },
            'nl-NL': {
              type: 'object',
              additionalProperties: false,
              properties: {}
            }
          },
          ui_schema_multiloc: {
            en: { 'ui:order': [] },
            'fr-FR': { 'ui:order': [] },
            'nl-NL': { 'ui:order': [] }
          }
        })
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to be_nil
      end
    end
  end

  describe 'with an unknown phase id' do
    let(:phase_id) { 'unknown' }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end
  end
end
