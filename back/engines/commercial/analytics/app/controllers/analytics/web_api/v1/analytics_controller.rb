# frozen_string_literal: true

require 'query'

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index
      def index
        handle_request
      end

      def create
        handle_request
      end

      private

      def handle_request
        authorize :analytics, policy_class: AnalyticsPolicy

        results, errors, response_status = if params[:query].instance_of?(Array)
          handle_multiple(params[:query])
        else
          handle_single(params[:query])
        end

        if errors.present?
          render json: { 'messages' => errors }, status: response_status
        else
          render json: { 'data' => results }
        end
      end

      def handle_single(json_query)
        query = Query.new(json_query)
        query.validate

        query.run if query.valid

        results = query.results
        errors = query.error_messages
        response_status = query.response_status

        [results, errors, response_status]
      end

      def handle_multiple(json_queries)
        results = []
        errors = {}
        statuses = []
        queries = []

        json_queries.each_with_index do |json_query, index|
          query = Query.new(json_query)
          queries.push(query)
          query.validate
          next if query.valid

          errors[index] = query.error_messages
          statuses.push(query.response_status)
        end

        if errors.blank?
          queries.each_with_index do |query, index|
            query.run
            if query.failed
              errors[index] = query.error_messages
              statuses.push(500)
            else
              results.push(query.results)
            end
          end
        end

        [results, errors, statuses.max]
      end
    end
  end
end
