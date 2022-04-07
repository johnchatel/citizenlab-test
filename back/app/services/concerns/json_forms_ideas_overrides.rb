module JsonFormsIdeasOverrides

  def custom_form_to_ui_schema fields, locale='en'
    project = fields.first.resource.project
    input_term = project.process_type == 'continuous' ? project.input_term : TimelineService.new.current_phase(project)&.input_term || 'idea'
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: input_term,
      },
      elements: drop_empty_categories([
        {
          type: 'Category',
          label: I18n.t("custom_forms.categories.main_content.#{input_term}.title", locale: locale),
          options: { id: 'mainContent' },
          elements: [
            yield(fields.find{|f| f.code == 'title_multiloc'}),
            yield(fields.find{|f| f.code == 'author_id'}),
            yield(fields.find{|f| f.code == 'body_multiloc'}),
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'details' },
          label: I18n.t('custom_forms.categories.details.title', locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'proposed_budget'}),
            yield(fields.find{|f| f.code == 'budget'}),
            yield(fields.find{|f| f.code == 'topic_ids'}),
            yield(fields.find{|f| f.code == 'location_description'}),
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t('custom_forms.categories.attachements.title', locale: locale),
          options: { id: 'attachments' },
          elements: [
            yield(fields.find{|f| f.code == 'idea_images_attributes'}),
            yield(fields.find{|f| f.code == 'idea_files_attributes'}),
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'extra' },
          label: I18n.t('custom_forms.categories.extra.title', locale: locale),
          elements: fields.reject(&:built_in?).map{|f| yield f, previousScope = '#/properties/custom_field_values/properties/'}
        }
      ].compact)
    }
  end

  def custom_form_to_json_schema fields, locale='en'
    {
      type: "object",
      additionalProperties: false,
      properties: fields.select(&:built_in?).inject({}) do |memo, field|
        override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
        memo[field.key] =
          if field.code && self.respond_to?(override_method, true)
            send(override_method, field, locale)
          else
            send("#{field.input_type}_to_json_schema_field", field, locale)
          end
        memo.tap do |properties|
          properties[:custom_field_values] = {
            type: "object",
            additionalProperties: false,
            properties: fields.reject(&:built_in?).inject({}) do |mem, field|
              override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
              mem[field.key] =
                if field.code && self.respond_to?(override_method, true)
                  send(override_method, field, locale)
                else
                  send("#{field.input_type}_to_json_schema_field", field, locale)
                end
              mem
            end
          }
        end
      end
    }.tap do |output|
      required = fields.select(&:enabled).select(&:required).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  private

  def drop_empty_categories categories
    categories.reject do |category|
      category[:elements].empty?
    end
  end

  def custom_form_title_multiloc_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core','locales').map do |locale|
        [
          locale,
          {
            type: 'string',
            minLength: 10,
            maxLength: 80
          }
        ]
      end.to_h
    }
  end

  def custom_form_title_multiloc_to_ui_schema_field field, locale, previousScope
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          scope: "#{previousScope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: locale, trim_on_blur: true, description: handle_description(field, locale) },
          label: handle_title(field, locale),
        }
      end
    }
  end

  def custom_form_body_multiloc_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core','locales').map do |locale|
        [
          locale,
          {
            type: 'string',
            minLength: 40,
          }
        ]
      end.to_h
    }
  end

  def custom_form_body_multiloc_to_ui_schema_field field, locale, previousScope
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          locale: locale,
          scope: "#{previousScope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: locale, render: 'WYSIWYG', description: handle_description(field, locale) },
          label: handle_title(field, locale),
        }
      end
    }
  end

  def custom_form_topic_ids_to_json_schema_field field, locale
    topics = field.resource.project&.allowed_input_topics
    {
      type: "array",
      uniqueItems: true,
      minItems: (field.enabled && field.required) ? 1 : 0,
      items: {
          type: "string",
      }.tap do |items|
        unless topics.empty?
          items[:oneOf] = topics.map do |topic|
            {
              const: topic.id,
              title: handle_title(topic, locale)
            }
          end
        end
      end,
    }
  end

  def custom_form_location_point_geojson_to_ui_schema_field field, locale
    {}
  end


  def custom_form_allowed_fields configuration, fields, current_user
    fields.filter { |f|
      f.code != 'author_id' && f.code != 'budget' || (
        f.code == 'author_id'&&
        configuration.feature_activated?('idea_author_change') &&
        current_user != nil &&
        UserRoleService.new.can_moderate_project?(f.resource.project, current_user)
      ) || (
        f.code == 'budget' &&
        configuration.feature_activated?('participatory_budgeting') &&
        current_user != nil &&
        UserRoleService.new.can_moderate_project?(f.resource.project, current_user) && (
          f.resource.project&.process_type == 'continuous' &&
          f.resource.project&.participation_method == 'budgeting'
        ) || (
          f.resource.project&.process_type == 'timeline' &&
          f.resource.project&.phases.any? { |p| p.participation_method == 'budgeting'}) )}
  end
end
