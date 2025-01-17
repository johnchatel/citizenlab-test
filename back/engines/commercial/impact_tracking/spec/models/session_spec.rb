# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImpactTracking::Session, type: :model do
  subject { build(:session) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end
end
