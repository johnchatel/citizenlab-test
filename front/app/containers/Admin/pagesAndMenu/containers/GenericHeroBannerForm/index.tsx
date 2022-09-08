import React, { ReactElement } from 'react';

// components
import { Section, SubSectionTitle } from 'components/admin/Section';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

import { IconTooltip } from '@citizenlab/cl2-component-library';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import { HomepageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import { CustomPageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner';

// constants
import Warning from 'components/UI/Warning';

// names differ slightly between HomePage and CustomPage
interface Props {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: () => void;
  isLoading: boolean;
  inputSettings: HeroBannerInputSettings;
  outletSectionStart?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
  bannerHeaderFieldsComponent?: ReactElement;
  bannerImageFieldsComponent?: ReactElement;
}

export type HeroBannerInputSettings =
  | HomepageHeroBannerInputSettings
  | CustomPageHeroBannerInputSettings;

const GenericHeroBannerForm = ({
  onSave,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  intl: { formatMessage },
  outletSectionStart,
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
  bannerHeaderFieldsComponent,
  bannerImageFieldsComponent,
}: Props & InjectedIntlProps) => {
  return (
    <SectionFormWrapper
      breadcrumbs={breadcrumbs}
      title={title}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={onSave}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <Section key={'header'}>
        <Warning>
          <FormattedMessage {...messages.heroBannerInfoBar} />
        </Warning>
        {outletSectionStart}
        <SubSectionTitle>
          <FormattedMessage {...messages.header_bg} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.headerBgTooltip}
                values={{
                  supportPageLink: (
                    <a
                      href={formatMessage(messages.headerImageSupportPageURL)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.headerImageSupportPageText}
                      />
                    </a>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>
        {bannerImageFieldsComponent}
        {bannerHeaderFieldsComponent}
        {bannerMultilocFieldComponent}
        {avatarsFieldComponent}
        {outletSectionEnd}
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericHeroBannerForm);
