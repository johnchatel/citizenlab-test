import React from 'react';

// Craft
import { useEditor, Element } from '@craftjs/core';

// Intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Components
import ToolboxItem from './ToolboxItem';
import { Box } from '@citizenlab/cl2-component-library';
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import Image from '../CraftComponents/Image';

// Intl
import messages from '../../messages';

// Styles
import styled from 'styled-components';

const DraggableElement = styled.div`
  cursor: move;
`;

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();

  return (
    <Box w="100%" display="inline">
      <DraggableElement
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element canvas is={Container} id="container" />
          )
        }
      >
        <ToolboxItem icon="column1" label={formatMessage(messages.oneColumn)} />
      </DraggableElement>
      <DraggableElement
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element canvas is={TwoColumn} columnLayout="1-1" id="twoColumn" />
          )
        }
      >
        <ToolboxItem icon="column2" label={formatMessage(messages.twoColumn)} />
      </DraggableElement>
      <DraggableElement
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element canvas is={ThreeColumn} id="threeColumn" />
          )
        }
      >
        <ToolboxItem
          icon="column3"
          label={formatMessage(messages.threeColumn)}
        />
      </DraggableElement>
      <DraggableElement
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={Text}
              id="text"
              text={formatMessage(messages.textValue)}
            />
          )
        }
      >
        <ToolboxItem icon="text" label={formatMessage(messages.text)} />
      </DraggableElement>
      <DraggableElement
        ref={(ref) =>
          ref &&
          connectors.create(ref, <Element is={Image} id="image" alt="" />)
        }
      >
        <ToolboxItem icon="image" label={formatMessage(messages.image)} />
      </DraggableElement>
    </Box>
  );
};

export default injectIntl(ContentBuilderToolbox);
