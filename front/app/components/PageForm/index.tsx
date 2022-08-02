import React from 'react';

// types
import { Multiloc, UploadFile } from 'typings';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, mixed } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';
import RHFQuillMultilocWithLocaleSwitcher from 'components/UI/RHFQuillMultilocWithLocaleSwitcher';
import RHFInput from 'components/UI/RHFInput';
import RHFFileUploader from 'components/UI/RHFFileUploader';
import RHFFeedback from 'components/UI/RHFFeedback';
import { SectionField } from 'components/admin/Section';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// components
import {
  IconTooltip,
  Label,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import Button from 'components/UI/Button';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { slugRexEx } from 'utils/textUtils';
import { handleRHFSubmissionError } from 'utils/errorUtils';

// hooks
import useLocale from 'hooks/useLocale';
import usePage from 'hooks/usePage';
import useAppConfiguration from 'hooks/useAppConfiguration';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
  pageId: string | null;
  hideSlugInput?: boolean;
} & InjectedIntlProps;

const PageForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
  pageId,
  hideSlugInput,
}: PageFormProps) => {
  const locale = useLocale();
  const page = usePage({ pageId });
  const appConfig = useAppConfiguration();

  const schema = object({
    title_multiloc: validateMultiloc(
      formatMessage(messages.emptyTitleErrorMessage)
    ),
    body_multiloc: validateMultiloc(
      formatMessage(messages.emptyDescriptionErrorMessage)
    ),
    ...(!hideSlugInput && {
      slug: string()
        .matches(slugRexEx, formatMessage(messages.slugRegexErrorMessage))
        .required(formatMessage(messages.emptySlugErrorMessage)),
      local_page_files: mixed(),
    }),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(appConfig)) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleRHFSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <SectionField>
          <RHFFeedback />
          <RHFInputMultilocWithLocaleSwitcher
            label={formatMessage(messages.pageTitle)}
            type="text"
            name="title_multiloc"
          />
        </SectionField>
        <SectionField>
          <RHFQuillMultilocWithLocaleSwitcher
            name="body_multiloc"
            label={formatMessage(messages.editContent)}
          />
        </SectionField>
        {!hideSlugInput && (
          <SectionField>
            <Label htmlFor="slug">
              <FormattedMessage {...messages.pageUrl} />
              {!isNilOrError(page) && (
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.slugLabelTooltip}
                      values={{
                        currentPageURL: (
                          <em>
                            <b>
                              {appConfig.data.attributes.host}/{locale}
                              /pages/{page.attributes.slug}
                            </b>
                          </em>
                        ),
                        currentPageSlug: (
                          <em>
                            <b>{page.attributes.slug}</b>
                          </em>
                        ),
                      }}
                    />
                  }
                />
              )}
            </Label>
            {!isNilOrError(page) && (
              <Box mb="16px">
                <Warning>
                  <FormattedMessage {...messages.brokenURLWarning} />
                </Warning>
              </Box>
            )}
            <RHFInput id="slug" name="slug" type="text" />
            <Text>
              <b>
                <FormattedMessage {...messages.resultingPageURL} />
              </b>
              : {appConfig.data.attributes.host}/{locale}/pages/
              {methods.getValues('slug')}
            </Text>
          </SectionField>
        )}
        <SectionField>
          <Label htmlFor="local_page_files">
            <FormattedMessage {...messages.fileUploadLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.fileUploadLabelTooltip} />
              }
            />
          </Label>
          <RHFFileUploader
            name="local_page_files"
            resourceId={pageId}
            resourceType="page"
          />
        </SectionField>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.savePage)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(PageForm);
