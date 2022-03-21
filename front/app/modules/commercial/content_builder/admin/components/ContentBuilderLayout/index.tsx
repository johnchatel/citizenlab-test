import React, { useEffect } from 'react';

// styles
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// intl
import { withRouter, WithRouterProps } from 'react-router';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Editor } from '@craftjs/core';
import ContentBuilderToolbox from '../ContentBuilderToolbox';
import ContentBuilderSettings from '../ContentBuilderSettings';
import Container from '../CraftComponents/Container';
import RenderNode from '../RenderNode';
import ContentBuilderTopBar from '../ContentBuilderTopBar';

const Wrapper = styled.div`
  flex: 0 0 auto;
  width: 210px;
`;

const ContainerInner = styled.nav`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  padding-top: ${stylingConsts.menuHeight + 10}px;
  background-color: ${colors.disabledPrimaryButtonBg};
  border-right: 1px solid ${colors.border};
`;

type ContentBuilderLayoutProps = {
  onMount: (isVisible: boolean) => void;
} & WithRouterProps;

const ContentBuilderLayout: React.FC<ContentBuilderLayoutProps> = ({
  children,
  onMount,
  location: { pathname },
}) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  const contentBuilderLayoutVisible =
    featureEnabled && pathname.includes('admin/content-builder');

  useEffect(() => {
    onMount(contentBuilderLayoutVisible);
  }, [onMount, contentBuilderLayoutVisible]);

  if (!contentBuilderLayoutVisible) {
    return null;
  }

  return (
    <Editor resolver={{ Box, Container }} onRender={RenderNode}>
      <Wrapper>
        <Box zIndex="100" margin-left="-100px" w="100%" position="fixed">
          <ContentBuilderTopBar />
        </Box>
        <ContainerInner>
          <ContentBuilderToolbox />
        </ContainerInner>
      </Wrapper>
      <Box w="100%" padding-top="400px">
        <RightColumn>{children}</RightColumn>
      </Box>
      <ContentBuilderSettings />
    </Editor>
  );
};

export default withRouter(ContentBuilderLayout);