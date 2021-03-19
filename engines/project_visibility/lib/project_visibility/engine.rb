# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module ProjectVisibility
  class Engine < ::Rails::Engine
    isolate_namespace ProjectVisibility
    config.generators.api_only = true

    # Sharing the factories to make them accessible from to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    def self.register_feature
      require 'project_visibility/feature_specification'
      AppConfiguration::Settings.add_feature(ProjectVisibility::FeatureSpecification)
    end

    config.to_prepare do
      ProjectVisibility::Engine.register_feature
    end
  end
end