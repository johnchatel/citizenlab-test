import React from 'react';

// craft
import { useEditor, Element } from '@craftjs/core';

// Router
import { useParams } from 'react-router-dom';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import Image from '../CraftComponents/Image';
import Iframe from '../CraftComponents/Iframe';
import AboutBox from '../CraftComponents/AboutBox';
import Accordion from '../CraftComponents/Accordion';
import WhiteSpace from '../CraftComponents/WhiteSpace';
import Container from '../CraftComponents/Container';

// intl
import messages from '../../messages';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// types
import { Locale } from 'typings';

const DraggableElement = styled.div`
  cursor: move;
`;

type ContentBuilderToolboxProps = {
  selectedLocale: Locale;
} & InjectedIntlProps;

const ContentBuilderToolbox = ({
  selectedLocale,
  intl: { formatMessage },
}: ContentBuilderToolboxProps) => {
  const { projectId } = useParams() as { projectId: string };
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
          <FormattedMessage {...messages.sections} />
        </Title>
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element id="image-text-cards" is={Box} canvas>
                <TwoColumn columnLayout="1-2">
                  <Element id="left" is={Container} canvas>
                    <Image alt="" />
                  </Element>
                  <Element id="right" is={Container} canvas>
                    <Text text={formatMessage(messages.textValue)} />
                  </Element>
                </TwoColumn>
                <TwoColumn columnLayout="1-2">
                  <Element id="left" is={Container} canvas>
                    <Image alt="" />
                  </Element>
                  <Element id="right" is={Container} canvas>
                    <Text text={formatMessage(messages.textValue)} />
                  </Element>
                </TwoColumn>
                <TwoColumn columnLayout="1-2">
                  <Element id="left" is={Container} canvas>
                    <Image alt="" />
                  </Element>
                  <Element id="right" is={Container} canvas>
                    <Text text={formatMessage(messages.textValue)} />
                  </Element>
                </TwoColumn>
              </Element>
            )
          }
        >
          <ToolboxItem
            icon="imageCardSection"
            label={formatMessage(messages.imageTextCards)}
          />
        </DraggableElement>
        <DraggableElement
          id="e2e-draggable-info-accordions"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <TwoColumn columnLayout="2-1">
                <Element id="left" is={Container} canvas>
                  <Text text={formatMessage(messages.loremIpsum)} />
                  <Accordion
                    title={formatMessage(messages.accordionTitleValue)}
                    text={formatMessage(messages.accordionTextValue)}
                    openByDefault={false}
                  />
                  <Accordion
                    title={formatMessage(messages.accordionTitleValue)}
                    text={formatMessage(messages.accordionTextValue)}
                    openByDefault={false}
                  />
                  <Accordion
                    title={formatMessage(messages.accordionTitleValue)}
                    text={formatMessage(messages.accordionTextValue)}
                    openByDefault={false}
                  />
                </Element>
                <Element id="right" is={Container} canvas>
                  <AboutBox projectId={projectId} />
                </Element>
              </TwoColumn>
            )
          }
        >
          <ToolboxItem
            icon="infoAccordionSection"
            label={formatMessage(messages.infoWithAccordions)}
          />
        </DraggableElement>
        <Title mt="32px" ml="5px" variant="h6" as="h1" color="label">
          <FormattedMessage {...messages.layout} />
        </Title>
        <DraggableElement
          id="e2e-draggable-two-column"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <TwoColumn columnLayout="1-1" id="twoColumn" />,
              {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              }
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
            connectors.create(ref, <ThreeColumn />, {
              onCreate: (node) => {
                selectNode(node.rootNodeId);
              },
            })
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
            connectors.create(ref, <WhiteSpace size="small" />, {
              onCreate: (node) => {
                selectNode(node.rootNodeId);
              },
            })
          }
        >
          <ToolboxItem
            icon="dashedBorderRectangle"
            label={formatMessage(messages.whiteSpace)}
          />
        </DraggableElement>
        <Title mt="32px" ml="4px" variant="h6" as="h1" color="label">
          <FormattedMessage {...messages.content} />
        </Title>
        <DraggableElement
          id="e2e-draggable-text"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Text text={formatMessage(messages.textValue)} />,
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
              connectors.create(ref, <Image imageUrl="" alt="" />, {
                onCreate: (node) => {
                  selectNode(node.rootNodeId);
                },
              });
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
              <Iframe
                url=""
                height={500}
                hasError={false}
                selectedLocale={selectedLocale}
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
            connectors.create(ref, <AboutBox projectId={projectId} />, {
              onCreate: (node) => {
                selectNode(node.rootNodeId);
              },
            })
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
              <Accordion
                title={formatMessage(messages.accordionTitleValue)}
                text={formatMessage(messages.accordionTextValue)}
                openByDefault={false}
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

export default injectIntl(ContentBuilderToolbox);
