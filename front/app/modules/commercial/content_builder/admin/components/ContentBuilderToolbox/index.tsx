import React from 'react';

// Craft
import { useEditor, Element } from '@craftjs/core';

// Router
import { withRouter, WithRouterProps } from 'react-router';

// Intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import Image from '../CraftComponents/Image';
import Iframe from '../CraftComponents/Iframe';
import AboutBox from '../CraftComponents/AboutBox';
import Accordion from '../CraftComponents/Accordion';
import WhiteSpace from '../CraftComponents/WhiteSpace';
import ImageTextCards from '../CraftSections/ImageTextCards';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';

// Intl
import messages from '../../messages';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const DraggableElement = styled.div`
  cursor: move;
`;

const ContentBuilderToolbox = ({
  intl: { formatMessage },
  params: { projectId },
}: InjectedIntlProps & WithRouterProps) => {
  const {
    connectors,
    actions: { selectNode },
  } = useEditor();

  return (
    <Box
      position="fixed"
      zIndex="99999"
      flex="0 0 auto"
      h="100%"
      w="210px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgColor="#ffffff"
      borderRight={`1px solid ${colors.mediumGrey}`}
    >
      <Box w="100%" display="inline">
        <Title mt="24px" ml="5px" variant="h6" as="h1" color="label">
          SECTIONS
        </Title>
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={ImageTextCards}
                id="imageTextCards"
                defaultText={formatMessage(messages.textValue)}
              />
            )
          }
        >
          <ToolboxItem
            icon="column1"
            label={formatMessage(messages.imageTextCards)}
          />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-info-accordions"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={InfoWithAccordions}
                projectId={projectId}
                id="infoWithAccordions"
                accordionTitle={formatMessage(messages.accordionTitleValue)}
                accordionText={formatMessage(messages.accordionTextValue)}
                textPlaceholder={formatMessage(messages.loremIpsum)}
              />
            )
          }
        >
          <ToolboxItem
            icon="column1"
            label={formatMessage(messages.infoWithAccordions)}
          />
        </DraggableElement>
        <Title mt="32px" ml="5px" variant="h6" as="h1" color="label">
          LAYOUT
        </Title>
        <DraggableElement
          id="e2e-draggable-single-column"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <ToolboxItem
            icon="column1"
            label={formatMessage(messages.oneColumn)}
          />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-two-column"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                canvas
                is={TwoColumn}
                columnLayout="1-1"
                id="twoColumn"
              />
            )
          }
        >
          <ToolboxItem
            icon="column2"
            label={formatMessage(messages.twoColumn)}
          />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-three-column"
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
          id="e2e-draggable-white-space"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element is={WhiteSpace} size="small" id="WhiteSpace" />,
              {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              }
            )
          }
        >
          <ToolboxItem
            icon="dashedBorderRectangle"
            label={formatMessage(messages.whiteSpace)}
          />
        </DraggableElement>
        <Title mt="32px" ml="4px" variant="h6" as="h1" color="label">
          CONTENT
        </Title>
        <DraggableElement
          id="e2e-draggable-text"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={Text}
                id="text"
                text={formatMessage(messages.textValue)}
              />,
              {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              }
            )
          }
        >
          <ToolboxItem icon="text" label={formatMessage(messages.text)} />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-image"
          ref={(ref) => {
            ref &&
              connectors.create(
                ref,
                <Element is={Image} imageUrl="" id="image" alt="" />,
                {
                  onCreate: (node) => {
                    selectNode(node.rootNodeId);
                  },
                }
              );
          }}
        >
          <ToolboxItem icon="image" label={formatMessage(messages.image)} />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-iframe"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={Iframe}
                id="Iframe"
                url=""
                height={500}
                hasError={false}
              />,
              {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              }
            )
          }
        >
          <ToolboxItem icon="code" label={formatMessage(messages.url)} />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-about-box"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element is={AboutBox} id="AboutBox" projectId={projectId} />
            )
          }
        >
          <ToolboxItem icon="info3" label={formatMessage(messages.aboutBox)} />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-accordion"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={Accordion}
                title={formatMessage(messages.accordionTitleValue)}
                text={formatMessage(messages.accordionTextValue)}
                openByDefault={false}
                id="Accordion"
              />,
              {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              }
            )
          }
        >
          <ToolboxItem
            icon="accordion"
            label={formatMessage(messages.accordion)}
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default withRouter(injectIntl(ContentBuilderToolbox));
