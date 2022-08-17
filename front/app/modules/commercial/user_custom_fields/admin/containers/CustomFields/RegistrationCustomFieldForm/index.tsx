import React from 'react';
import { IUserCustomFieldInputType } from '../../../../services/userCustomFields';

import { Button, Box } from '@citizenlab/cl2-component-library';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean, string } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import Toggle from 'components/HookForm/Toggle';
import Select from 'components/HookForm/Select';
import { Section, SectionField } from 'components/admin/Section';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

export interface FormValues {
  enabled: boolean;
  input_type: IUserCustomFieldInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
}

type Props = {
  mode: 'new' | 'edit';
  customFieldId?: string;
  builtInField: boolean;
  defaultValues?: FormValues;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
} & InjectedIntlProps;

const fieldTypes = [
  'select',
  'multiselect',
  'checkbox',
  'text',
  'multiline_text',
  'number',
  'date',
];

const RegistrationCustomFieldForm = ({
  intl: { formatMessage },
  defaultValues,
  onSubmit,
  builtInField,
}: Props) => {
  const schema = object({
    input_type: string()
      .oneOf(fieldTypes, 'input type error')
      .required('input type error'),
    title_multiloc: validateMultiloc('title error'),
    description_multiloc: validateMultiloc('description error'),
    required: boolean().required(),
  });
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const inputTypeOptions = () => {
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: formatMessage(messages[`fieldType_${inputType}`]),
    }));
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <Section>
          <SectionField>
            <Feedback />
            <Select
              name="input_type"
              options={inputTypeOptions()}
              label={formatMessage(messages.answerFormat)}
            />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldName)}
              type="text"
              name="title_multiloc"
              disabled={builtInField}
            />
          </SectionField>

          <SectionField>
            <TextAreaMultilocWithLocaleSwitcher
              name="description_multiloc"
              label={formatMessage(messages.fieldDescription)}
              disabled={builtInField}
            />
          </SectionField>

          <SectionField>
            <Toggle
              name="required"
              label={formatMessage(messages.isFieldRequired)}
            />
          </SectionField>
        </Section>

        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            Save field
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(RegistrationCustomFieldForm);
