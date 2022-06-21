# frozen_string_literal: true

class UserCustomFields::Representativeness::RScore
  attr_reader :value, :user_counts, :ref_distribution

  # @param [Numeric] value
  # @param [UserCustomFields::Representativeness::RefDistribution] ref_distribution
  def initialize(value, user_counts, ref_distribution)
    @value = value
    @user_counts = user_counts
    @ref_distribution = ref_distribution
    @timestamp = Time.zone.now
  end

  def id
    "#{@ref_distribution.id}_#{@timestamp.to_i}_rscore"
  end

  class << self
    # Factory method that instantiates an RScore based on observed user counts and a reference distribution.
    # @param [Hash] user_counts
    # @param [UserCustomFields::Representativeness::RefDistribution] ref_distribution
    # @return [UserCustomFields::Representativeness::RScore]
    def compute(user_counts, ref_distribution)
      population_counts = ref_distribution.distribution
      check_user_counts_options!(user_counts, ref_distribution)

      score_value = compute_scores(user_counts, population_counts)[:min_max_p_ratio]
      new(score_value, user_counts, ref_distribution)
    end

    # Compute the ratio between the minimum and maximum participation rates.
    # @param [Hash] user_counts
    # @param [Hash] population_counts
    # @return [Numeric]
    def min_max_p_ratio(user_counts, population_counts)
      min_rate, max_rate = participation_rates(user_counts, population_counts).minmax
      min_rate / max_rate
    end

    # Compute the ratio between the minimum and mean participation rates.
    # @param [Hash] user_counts
    # @param [Hash] population_counts
    # @return [Numeric]
    def min_mean_p_ratio(user_counts, population_counts)
      participation_rates = send(:participation_rates, user_counts, population_counts)
      min_rate = participation_rates.min
      mean_rate = participation_rates.sum.to_f / participation_rates.size
      min_rate / mean_rate
    end

    def participation_rates(user_counts, population_counts)
      population_counts.keys.map do |option_id|
        user_counts.fetch(option_id, 0) / population_counts[option_id].to_f
      end
    end

    def proportional_similarity(user_counts, population_counts)
      user_counts = user_counts.slice(*population_counts.keys)
      user_distribution = normalize(user_counts)
      population_distribution = normalize(population_counts)

      population_distribution.sum do |option_id, prob|
        [prob, user_distribution.fetch(option_id, 0)].min
      end
    end

    private

    def compute_scores(user_counts, population_counts)
      scores = {
        min_max_p_ratio: min_max_p_ratio(user_counts, population_counts),
        min_mean_p_ratio: min_mean_p_ratio(user_counts, population_counts),
        proportional_similarity: proportional_similarity(user_counts, population_counts)
      }

      Rails.logger.info(
        'Computing R-score',
        scores: scores, user_counts: user_counts, population_counts: population_counts
      )

      scores
    end

    def normalize(counts)
      total = counts.values.sum
      counts.transform_values { |count| count.to_f / total }
    end

    def check_user_counts_options!(user_counts, ref_distribution)
      known_options = ref_distribution.distribution.keys + [UserCustomFields::FieldValueCounter::UNKNOWN_VALUE_LABEL]
      unknown_options = user_counts.keys - known_options
      return if unknown_options.blank?

      raise ArgumentError, <<~MSG.squish
        'user_counts' contains unknown options that are not specified in 'ref_distribution'.
        Unknown options: #{unknown_options.map(&:inspect).join(', ')}.
      MSG
    end
  end
end
