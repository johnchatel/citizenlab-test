// libraries
import React, { useState } from 'react';
import { findDOMNode } from 'react-dom';
import { trackEventByName } from 'utils/analytics';
import { Canvg } from 'canvg';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import { Dropdown } from '@citizenlab/cl2-component-library';
import { requestBlob } from 'utils/request';
import { reportError } from 'utils/loggingUtils';
import { saveAs } from 'file-saver';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IResolution } from 'components/admin/ResolutionControl';

const DropdownButton = styled(Button)``;

const Container = styled.div`
  display: flex;
  align-items: end;
  position: relative;
  cursor: pointer;
`;

interface ReportExportMenuProps {
  className?: string;
  name: string;
  svgNode?: React.RefObject<any>;
  xlsxEndpoint?: string;
  startAt?: string | null | undefined;
  endAt?: string | null;
  resolution?: IResolution;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentTopicFilter?: string | undefined;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
}

const ReportExportMenu = ({
  svgNode,
  className,
  xlsxEndpoint,
  name,
  startAt,
  endAt,
  resolution,
  currentGroupFilter,
  currentTopicFilter,
  currentProjectFilter,
  currentGroupFilterLabel,
  currentTopicFilterLabel,
  currentProjectFilterLabel,
  intl: { formatMessage, formatDate },
}: ReportExportMenuProps & InjectedIntlProps) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [exportingXls, setExportingXls] = useState(false);

  const readableDate = (date: string) => {
    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fileName = `${name}${
    startAt
      ? `_${formatMessage(messages.fromFilter)}-${readableDate(startAt)}`
      : ''
  }${
    endAt
      ? `_${formatMessage(messages.untilFilter)}-${readableDate(endAt)}`
      : ''
  }${
    currentProjectFilterLabel
      ? `_${formatMessage(messages.projectFilter)}-${currentProjectFilterLabel}`
      : ''
  }${
    currentGroupFilterLabel
      ? `_${formatMessage(messages.groupFilter)}-${currentGroupFilterLabel}`
      : ''
  }${
    currentTopicFilterLabel
      ? `_${formatMessage(messages.topicFilter)}-${currentTopicFilterLabel}`
      : ''
  }`;

  const handleDownloadSvg = () => {
    // eslint-disable-next-line react/no-find-dom-node
    const node = findDOMNode(svgNode && svgNode.current.container.children[0]);
    if (node) {
      const svgContent = new XMLSerializer().serializeToString(node);
      const svgBlob = new Blob([svgContent], {
        type: 'image/svg+xml;charset=utf-8',
      });
      setDropdownOpened(false);
      saveAs(svgBlob, `${fileName}.svg`);
    }

    trackEventByName('Clicked export svg', { extra: { graph: name } });
  };

  const handleDownloadPng = async () => {
    // eslint-disable-next-line react/no-find-dom-node
    const node = findDOMNode(svgNode && svgNode.current.container.children[0]);
    if (node) {
      const svgContent = new XMLSerializer().serializeToString(node);
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const v = await Canvg.fromString(ctx, svgContent);

      // Start SVG rendering with animations and mouse handling.
      v.start();

      // Convert the Canvas to an image
      const link = document.createElement('a');
      link.setAttribute('download', `${fileName}.png`);
      link.setAttribute(
        'href',
        canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
      );
      link.click();
    }

    // trackEventByName('Clicked export svg', { extra: { graph: name } });
  };

  const toggleDropdown = (value?: boolean) => () => {
    setDropdownOpened(value || !dropdownOpened);
  };

  const downloadXlsx = async () => {
    try {
      setExportingXls(true);
      const blob = await requestBlob(
        xlsxEndpoint,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        {
          start_at: startAt,
          end_at: endAt,
          interval: resolution,
          project: currentProjectFilter,
          group: currentGroupFilter,
          topic: currentTopicFilter,
        }
      );
      if (blob.size <= 2467) {
        throw new Error(`Empty xlsx : ${xlsxEndpoint}`);
      }
      saveAs(blob, `${fileName}.xlsx`);
      setExportingXls(false);
      setDropdownOpened(false);
    } catch (error) {
      reportError(error);
      setExportingXls(false);
    }

    // track this click for user analytics
    trackEventByName('Clicked export xlsx', { extra: { graph: name } });
  };

  return (
    <Container className={className}>
      <DropdownButton
        buttonStyle="admin-dark-text"
        onClick={toggleDropdown()}
        icon="download"
        iconPos="right"
        padding="10px"
      />
      <Dropdown
        width="100%"
        top="35px"
        right="-5px"
        mobileRight="-5px"
        opened={dropdownOpened}
        onClickOutside={toggleDropdown(false)}
        content={
          <>
            {svgNode && (
              <Button
                onClick={handleDownloadSvg}
                buttonStyle="text"
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.downloadAsImage} />
              </Button>
            )}
            {svgNode && (
              <Button
                onClick={handleDownloadPng}
                buttonStyle="text"
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                Download as PNG
              </Button>
            )}
            {xlsxEndpoint && (
              <Button
                onClick={downloadXlsx}
                buttonStyle="text"
                processing={exportingXls}
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.downloadXlsx} />
              </Button>
            )}
          </>
        }
      />
    </Container>
  );
};

export default injectIntl(ReportExportMenu);
