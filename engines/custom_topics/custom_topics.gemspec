$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "custom_topics/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "custom_topics"
  s.version     = CustomTopics::VERSION
  s.authors     = ['CitizenLab']
  s.email       = ['developers@citizenlab.co']
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = 'CitizenLab extension: Allows customization of topics.'

  s.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.0.0'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
