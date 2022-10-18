import React from 'react';
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import Button from 'components/UI/Button';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import HelmetIntl from 'components/HelmetIntl';

// typings
import { Multiloc } from 'typings';

// constants
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// services and hooks
import { ICustomPageData } from 'services/customPages';
import { IHomepageSettingsData } from 'services/homepageSettings';

// utils
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

interface Props {
  pageData: IHomepageSettingsData | ICustomPageData;
  updatePage: (data: { top_info_section_multiloc: Multiloc }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
}

interface FormValues {
  top_info_section_multiloc: Multiloc;
}

const GenericTopInfoSection = ({
  pageData,
  updatePage,
  breadcrumbs,
  intl: { formatMessage },
}: InjectedIntlProps & Props) => {
  const theme: any = useTheme();

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await updatePage(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const schema = object({
    top_info_section_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.missingOneLocaleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      top_info_section_multiloc: pageData.attributes.top_info_section_multiloc,
    },
    resolver: yupResolver(schema),
  });

  return (
    <>
      <HelmetIntl title={messages.topInfoMetaTitle} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <SectionFormWrapper
            breadcrumbs={[
              {
                label: formatMessage(pagesAndMenuBreadcrumb.label),
                linkTo: pagesAndMenuBreadcrumb.linkTo,
              },
              ...breadcrumbs,
              { label: formatMessage(messages.topInfoPageTitle) },
            ]}
            title={formatMessage(messages.topInfoPageTitle)}
          >
            <Feedback
              successMessage={formatMessage(messages.topInfoMessageSuccess)}
            />
            <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
              <QuillMultilocWithLocaleSwitcher
                name="top_info_section_multiloc"
                label={formatMessage(messages.topInfoContentEditorTitle)}
                withCTAButton
              />
            </Box>
            <Box display="flex">
              <Button
                type="submit"
                processing={methods.formState.isSubmitting}
                data-cy={`e2e-top-info-section-submit`}
              >
                {formatMessage(messages.topInfoSaveButton)}
              </Button>
            </Box>
          </SectionFormWrapper>
        </form>
      </FormProvider>
    </>
  );
};

export default injectIntl(GenericTopInfoSection);