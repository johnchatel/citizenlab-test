import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import { Image } from '@citizenlab/cl2-component-library';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 50px;
  padding-bottom: 20px;
  background: #fff;
  width: 100%;
`;

const LogoLink = styled.a`
  cursor: pointer;
`;

const TenantLogo = injectIntl(
  ({ src, localizedOrgName }: { src: string; localizedOrgName: string }) => {
    return (
      <Image
        src={src}
        alt={localizedOrgName}
        height="100px"
        marginBottom="20px"
      />
    );
  }
);

interface Props {}

const CityLogoSection = memo(
  injectLocalize(
    ({
      localize,
      intl: { formatMessage },
    }: Props & InjectedIntlProps & InjectedLocalized) => {
      const locale = useLocale();
      const appConfiguration = useAppConfiguration();

      if (!isNilOrError(appConfiguration)) {
        const currentTenantLogo =
          appConfiguration.data.attributes.logo?.medium || null;
        const tenantSite =
          appConfiguration.data.attributes.settings.core.organization_site;
        const footerLocale = `footer-city-logo-${locale}`;
        const localizedOrgName = localize(
          appConfiguration.data.attributes.settings.core.organization_name
        );

        if (currentTenantLogo) {
          return (
            <Fragment
              title={formatMessage(messages.iframeTitle)}
              name={footerLocale}
            >
              <Container id="hook-footer-logo">
                {tenantSite ? (
                  <LogoLink href={tenantSite} target="_blank">
                    <TenantLogo
                      src={currentTenantLogo}
                      localizedOrgName={localizedOrgName}
                    />
                  </LogoLink>
                ) : (
                  <TenantLogo
                    localizedOrgName={localizedOrgName}
                    src={currentTenantLogo}
                  />
                )}
              </Container>
            </Fragment>
          );
        }
      }

      return null;
    }
  )
);

export default injectIntl(CityLogoSection);
