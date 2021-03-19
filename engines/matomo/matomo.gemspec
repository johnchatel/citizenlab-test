$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "matomo/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "matomo"
  s.version     = Matomo::VERSION
  s.authors     = ['CitizenLab']
  s.email       = ['developers@citizenlab.co']
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = "Enables sending front-end events to matomo for analytics"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency 'rails', '~> 6.0.0'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end