import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import GenericHeroBannerForm, {
  HeroBannerInputSettings,
} from '../../../GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
// change
import messages from '../../../HeroBanner/messages';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { forOwn, isEqual } from 'lodash-es';

import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stateFromForm, setStateFromForm] =
    useState<HeroBannerInputSettings | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');
  
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);
  
  if (isNilOrError(customPage)) {
    return null;
  }

  const { attributes } = customPage;
  const updateStateFromForm = (formState: HeroBannerInputSettings) => {
    setStateFromForm(formState);
  };

  const handleSave = async () => {
    if (!stateFromForm) return;
    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(stateFromForm, (value, key) => {
      if (!isEqual(value, customPage.attributes[key])) {
        diffedValues[key] = value;
      }
    });

    setIsLoading(true);
    setFormStatus('disabled');
    try {
      await updateCustomPage(customPageId, stateFromForm);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      setIsLoading(false);
      setFormStatus('error');
    }
  };

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(homeBreadcrumb.label),
          linkTo: homeBreadcrumb.linkTo,
        },
        { label: formatMessage(messages.heroBannerTitle) },
      ]}
      title={formatMessage(messages.heroBannerTitle)}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={handleSave}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <GenericHeroBannerForm
        type="customPage"
        banner_layout={attributes.banner_layout}
        banner_overlay_color={attributes.banner_overlay_color}
        banner_overlay_opacity={attributes.banner_overlay_opacity}
        banner_header_multiloc={attributes.banner_header_multiloc}
        banner_subheader_multiloc={attributes.banner_subheader_multiloc}
        header_bg={attributes.header_bg}
        updateStateFromForm={updateStateFromForm}
        setFormStatus={setFormStatus}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(EditCustomPageHeroBannerForm);
