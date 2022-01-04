import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import useTopics from './useTopics';

export default (projectId) => {
  const topics = useTopics({ projectId });

  return {
    schema: {
      type: 'object',
      properties: {
        title_multiloc: {
          type: 'object',
          minProperties: 1,
          properties: {
            en: {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
            'nl-BE': {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
            'fr-BE': {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
          },
        },
        body_multiloc: {
          type: 'object',
          minLength: 3,
          minProperties: 1,
          properties: {
            en: {
              minLength: 40,
              // TODO custom validation sanitizes html before counting
              type: 'string',
            },
            'nl-BE': {
              minLength: 40,
              type: 'string',
            },
            'fr-BE': {
              minLength: 40,
              type: 'string',
            },
          },
        },
        topic_ids: {
          type: 'array',
          prefixItems: [
            { type: 'string' },
            {
              enum: !isNilOrError(topics)
                ? topics
                    .filter((topic) => !isNilOrError(topic))
                    .map((topic: ITopicData) => topic.id)
                : [],
            },
          ],
        },
        idea_images_attributes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
              },
            },
          },
        },
        attachments: {
          type: 'string',
          properties: {},
        },
        location_point_geojson: {
          type: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: {
              type: 'string',
              enum: ['Point'],
            },
            coordinates: {
              type: 'array',
              minItems: 2,
              items: {
                type: 'number',
              },
            },
          },
        },
        location_description: {
          type: 'string',
        },
      },
      required: ['title_multiloc', 'body_multiloc'],
    },
    uiSchema: {
      type: 'Categorization',
      options: {
        submit: 'ButtonBar',
        // Used as an unique id for form accessibility
        formId: 'ideaForm',
        // must an InputTerm, for now only supports 'idea' and 'contribution' (used for error messages)
        inputTerm: 'idea',
      },
      elements: [
        {
          type: 'Category',
          label: "What's your idea ?",
          elements: [
            {
              type: 'VerticalLayout',
              render: 'multiloc',
              label: 'Title',
              elements: [
                {
                  type: 'Control',
                  locale: 'en',
                  scope: '#/properties/title_multiloc/properties/en',
                },
                {
                  type: 'Control',
                  locale: 'nl-BE',
                  scope: '#/properties/title_multiloc/properties/nl-BE',
                },
                {
                  type: 'Control',
                  locale: 'fr-BE',
                  scope: '#/properties/title_multiloc/properties/fr-BE',
                },
              ],
            },
            {
              type: 'VerticalLayout',
              render: 'multiloc',
              label: 'Description',
              elements: [
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'en',
                  scope: '#/properties/body_multiloc/properties/en',
                },
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'nl-BE',
                  scope: '#/properties/body_multiloc/properties/nl-BE',
                },
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'fr-BE',
                  scope: '#/properties/body_multiloc/properties/fr-BE',
                },
              ],
            },
          ],
        },
        {
          type: 'Category',
          label: 'Details',
          elements: [
            {
              type: 'Control',
              label: 'Tags',
              scope: '#/properties/topic_ids',
              options: !isNilOrError(topics)
                ? topics
                    .filter((topic) => !isNilOrError(topic))
                    .map((topic: ITopicData) => ({
                      id: topic.id,
                      attributes: {
                        title_multiloc: topic.attributes.title_multiloc,
                      },
                    }))
                : [],
            },
            {
              type: 'Control',
              label: 'Location',
              scope: '#/properties/location_description',
            },
          ],
        },
        {
          type: 'Category',
          label: 'Images and Attachments',
          elements: [
            {
              type: 'Control',
              label: 'Image',
              scope: '#/properties/idea_images_attributes',
            },
            {
              type: 'Control',
              label: 'Attachments',
              scope: '#/properties/attachments',
            },
          ],
        },
      ],
    },
  };
};

// constraints and naming convetions :

/*
 For topics (and hopefully any other multiple choice beteen another ressource and you can't add an option) :
 ${option}_ids are an attribute on the input, they're fed into the initial form data fetching relationships.${option}s.data.map(t => t.id)

 For images and attachements (and hopefully any other dependant:destroy resource where you can upload things that only beloc to this input) :
 ${attachement}s_attributes are an attribute on the input. They're only used for image creation, the conltrol, when in edit mode
 (ie an inputId was provided to the form), will fetch the images with useIdeaImages (to be replaced in the future with a more generic useInputImages and useInputAttachements)
 to display and remove existing resources

*/
