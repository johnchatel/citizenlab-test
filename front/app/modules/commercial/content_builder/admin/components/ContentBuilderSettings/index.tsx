import React, { useState, useEffect } from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Title, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// craft
import { useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import { getComponentNameMessage } from '../RenderNode';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const ContentBuilderSettings = () => {
  const [topOffset, setTopOffset] = useState(0);
  const [topVal, setTopVal] = useState(90);

  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selected;
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  useEffect(() => {
    const vh = document.documentElement.clientHeight;
    setTopVal(topOffset > vh ? topOffset - vh : 160);
  }, [topOffset]);

  const measuredRef = (node: HTMLDivElement | null) => {
    if (node !== null) {
      const topOffset = node.getBoundingClientRect().top;
      setTopOffset(topOffset - 20); // Show full button
    }
  };

  return selected && isEnabled && selected.id !== ROOT_NODE ? (
    <StyledBox
      id="settings-box"
      position="sticky"
      top={`${topVal}px`}
      zIndex="2"
      p="20px"
      w="400px"
    >
      <Title variant="h2">
        <FormattedMessage {...getComponentNameMessage(selected.name)} />
      </Title>
      {selected.settings && React.createElement(selected.settings)}
      {selected.isDeletable ? (
        <Box display="flex" ref={measuredRef}>
          <Button
            icon="delete"
            buttonStyle="primary-outlined"
            borderColor={colors.clRed}
            textColor={colors.clRed}
            iconColor={colors.clRed}
            onClick={() => {
              actions.delete(selected.id);
            }}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Box>
      ) : null}
    </StyledBox>
  ) : null;
};

export default ContentBuilderSettings;
