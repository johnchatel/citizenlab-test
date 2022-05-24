# frozen_string_literal: true

module NLP
  class TagSuggestionService
    def suggest(ideas, locale)
      @api ||= NLP::Api.new
      @texts = parse_ideas ideas, locale
      if @texts.any?
        @api.tag_suggestions({
          locale: locale,
          max_number_of_suggestions: 20,
          texts: @texts
        }.freeze)
      else
        []
      end
    end

    private

    def parse_ideas(ideas, locale)
      ideas.map do |idea|
        ActionView::Base.full_sanitizer.sanitize(idea.body_multiloc[locale])
      end.reject(&:blank?)
    end
  end
end
