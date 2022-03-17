class MultilocValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    validate_presence record, attribute, value
    return if record.errors.present? || value.nil?

    validate_supported_locales record, attribute, value
    validate_values_not_all_strings record, attribute, value
    validate_length record, attribute, value
    validate_html record, attribute, value
  end

  private

  def validate_presence(record, attribute, value)
    if (options[:presence] && !value.kind_of?(Hash)) || (!options[:presence] && !(value.kind_of?(Hash) || value.nil?))
      record.errors[attribute] << (options[:message] || 'is not a translation hash')
      return
    end

    sanitizer = SanitizationService.new
    if options[:presence] && value.values.all? { |text_or_html| !sanitizer.html_with_content?(text_or_html) }
      message = options[:message] || 'should be set for at least one locale'
      record.errors.add attribute, :blank, message: message
    end
  end

  def validate_values_not_all_strings(record, attribute, value)
    if value&.values && !value.values.all? { |v| v.is_a? String }
      locales = value.keys.reject { |l| value[l].is_a?(String) }
      message = "non-string values (for #{locales}) cannot be accepted. Either the key should be removed, or the value should be replaced by an empty string"
      record.errors.add attribute, :values_not_all_strings, message: message
    end
  end

  def validate_supported_locales(record, attribute, value)
    locales = CL2_SUPPORTED_LOCALES.map(&:to_s)
    if !(value.keys - locales).empty?
      message = options[:message] || "contains unsupported locales #{value.keys - locales}"
      record.errors.add attribute, :unsupported_locales, message: message
    end
  end

  def validate_length(record, attribute, value)
    if options[:length]
      options[:length].each do |constraint, constraint_value|
        if constraint == :in
          if !value.values.select { |v| v.size < constraint_value.first }.empty?
            message = options[:too_short] || "is too short (minimum is #{constraint_value} characters)"
            record.errors.add attribute, :too_short, message: message
          end
          if !value.values.select { |v| v.size > constraint_value.last }.empty?
            message = options[:too_long] || "is too long (maximum is #{constraint_value} characters)"
            record.errors.add attribute, :too_long, message: message
          end
        elsif constraint == :is
          if !value.values.select { |v| v.size != constraint_value }.empty?
            message = options[:wrong_length] || "is the wrong length (should be #{constraint_value} characters)"
            record.errors.add attribute, :wrong_length, message: message
          end
        elsif constraint == :maximum
          if !value.values.select { |v| v.size > constraint_value }.empty?
            message = options[:too_long] || "is too long (maximum is #{constraint_value} characters)"
            record.errors.add attribute, :too_long, message: message
          end
        elsif constraint == :minimum
          if !value.values.select { |v| v.size < constraint_value }.empty?
            message = options[:too_short] || "is too short (minimum is #{constraint_value} characters)"
            record.errors.add attribute, :too_short, message: message
          end
        end
      end
    end
  end

  def validate_html(record, attribute, value)
    if options[:html]
      value.each do |key, html|
        doc = Nokogiri::HTML.fragment html
        next if doc.text == html

        doc.errors.each do |error|
          record.errors.add attribute, :bad_html, message: "#{key}: #{error.message}"
        end
      end
    end
  end
end
