import React, { ReactNode, memo } from 'react';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

const HeaderText = styled.h1`
  font-size: 2rem;
`;

const HeaderContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

interface Props {
  onClickGoBack: () => void;
  headerMessage: string;
  showHorizontalRule?: boolean;
  children?: ReactNode;
}

const TextingHeader = memo<Props>(
  ({ onClickGoBack, headerMessage, showHorizontalRule, children }) => {
    return (
      <Box>
        <Button
          justify="left"
          onClick={onClickGoBack}
          buttonStyle="text"
          icon="arrow-back"
          padding="0"
          size="2"
          mb="2rem"
          text={'Go back'}
        />
        <HeaderContainer>
          <HeaderText>{headerMessage}</HeaderText>
          {children}
        </HeaderContainer>
        {showHorizontalRule && <hr />}
      </Box>
    );
  }
);

export default TextingHeader;
