import React from 'react';
import { removeFocus } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FullMobileNavMenuItem from './FullMobileNavMenuItem';
import TenantLogo from './TenantLogo';

// styles
import styled, { css } from 'styled-components';
import { media, colors, defaultOutline, hexToRgb } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const containerBackgroundColorRgb = hexToRgb(colors.label);

const Container = styled.div`
  bottom: ${(props) => props.theme.mobileMenuHeight}px;
  top: 0;
  position: fixed;
  ${containerBackgroundColorRgb
    ? css`
        background: rgba(
          ${containerBackgroundColorRgb.r},
          ${containerBackgroundColorRgb.g},
          ${containerBackgroundColorRgb.b},
          0.95
        );
      `
    : css`
        background: rgba(0, 0, 0, 0.75);
      `}
  height: 100%;
  width: 100%;
  z-index: 1004;
  padding-top: 50px;
`;

const ContentContainer = styled.nav`
  position: relative;
  height: 100%;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  background: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  width: 30px;
  height: 30px;
  position: absolute;
  top: 19px;
  right: 25px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.smallerThanMinTablet`
    top: 13px;
    right: 15px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${(props: any) => props.theme.colorText};
`;

const MenuItems = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StyledTenantLogo = styled(TenantLogo)`
  margin-bottom: 60px;
`;

interface Props {
  onClose: () => void;
}

const FullMobileNavMenu = ({
  intl: { formatMessage },
  onClose,
}: Props & InjectedIntlProps) => {
  const items = [
    {
      key: 'home',
      linkTo: '/',
      linkMessage: messages.mobilePageHome,
    },
    {
      key: 'projects',
      linkTo: '/projects',
      linkMessage: messages.mobilePageProjects,
    },
    {
      key: 'all-input',
      linkTo: '/ideas',
      linkMessage: messages.mobilePageAllInput,
    },
    {
      key: 'proposals',
      linkTo: '/initiatives',
      linkMessage: messages.mobilePageProposals,
    },
    {
      key: 'events',
      linkTo: '/events',
      linkMessage: messages.mobilePageEvents,
    },
    {
      key: 'about',
      linkTo: '/pages/information',
      linkMessage: messages.mobilePageAbout,
    },
    {
      key: 'faq',
      linkTo: '/pages/faq',
      linkMessage: messages.mobilePageFaq,
    },
  ];
  const handleOnClose = () => {
    onClose();
  };
  return (
    <Container>
      <CloseButton onMouseDown={removeFocus} onClick={handleOnClose}>
        <CloseIcon
          title={formatMessage(messages.closeMobileNavMenu)}
          name="close"
        />
      </CloseButton>
      <ContentContainer>
        <StyledTenantLogo />
        <MenuItems>
          {items.map((item) => {
            return (
              <FullMobileNavMenuItem
                key={item.key}
                linkTo={item.linkTo}
                linkMessage={item.linkMessage}
                onClick={handleOnClose}
              />
            );
          })}
        </MenuItems>
      </ContentContainer>
    </Container>
  );
};

export default injectIntl(FullMobileNavMenu);
