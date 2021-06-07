# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Batch category assignments for view inputs' do
  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }

  let(:input_instances) { create_list(:idea, 3, project: view.scope) }
  let(:inputs) { input_instances.pluck(:id) }
  let(:category_instances) { create_list(:category, 3, view: view) }
  let(:categories) { category_instances.pluck(:id) }

  let(:assignment_service) { Insights::CategoryAssignmentsService.new }
  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  post 'web_api/v1/insights/views/:view_id/batch/assign_categories' do
    parameter :inputs, 'An array of input identifiers', required: true
    parameter :categories, 'An array of category identifiers', required: true

    context 'when admin' do
      before { admin_header_token }

      example_request 'assigns a set of categories to multiple inputs' do
        expect(status).to eq(204)

        inputs.each do |input_id|
          assignments = assignment_service.assignments(input_id, view)
          expect(assignments.pluck(:category_id)).to match(categories)
        end
      end

      example 'does not fail when categories were already assigned (idempotent)', document: false do
        assignment_service.add_assignments!(input_instances.first, category_instances)

        do_request

        expect(status).to eq(204)
        inputs.each do |input_id|
          assignments = assignment_service.assignments(input_id, view)
          expect(assignments.pluck(:category_id)).to match(categories)
        end
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views/:view_id/batch/remove_categories' do
    parameter :inputs, 'An array of input identifiers', required: true
    parameter :categories, 'An array of category identifiers', required: true

    before do
      assignment_service.add_assignments_batch(input_instances, category_instances)
    end

    context 'when admin' do
      before { admin_header_token }

      let(:inputs) { input_instances[0..1].pluck(:id) }
      let(:categories) { category_instances[0..1].pluck(:id) }

      example_request 'removes a set of categories from multiple inputs' do
        expect(status).to eq(204)

        aggregate_failures 'checking categories were removed' do
          inputs.each do |input_id|
            assignments = assignment_service.assignments(input_id, view)
            expect(assignments.pluck(:category_id)).to match([category_instances.last.id])
          end
        end

        # Checking categories were not removed from the last input.
        assignments = assignment_service.assignments(input_instances.last, view)
        expect(assignments.map(&:category)).to match(category_instances)
      end
    end

    include_examples 'unauthorized requests'
  end
end
