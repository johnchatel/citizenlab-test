require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:feature_name) { RemoveCitizenlabBranding::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(feature_name)
  end
end
