import React, { useRef } from 'react';

// components
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';
import CenterLabel from './CenterLabel';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../../hooks/usePostsFeedback/messages';

// hooks
import usePostsWithFeedback from '../../hooks/usePostsFeedback';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { InjectedIntlProps } from 'react-intl';

interface Props {
  projectId?: string;
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  ${media.smallerThan1100px`
    flex-direction: column;
  `}
`;

const RadarChartContainer = styled.div`
  width: 50%;
  height: 100%;
  padding: 8px;

  ${media.smallerThan1100px`
    width: 100%;
    height: 50%;
  `}
`;

const ProgressBarsContainer = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  ${media.smallerThan1100px`
    width: 100%;
    height: 50%;
  `}
`;

const PostFeedback = ({
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentPieChart = useRef();
  const currentProgressBarsChart = useRef();
  const data = usePostsWithFeedback(formatMessage, projectId);

  if (isNilOrError(data)) return null;

  const {
    pieData,
    pieCenterValue,
    pieCenterLabel,
    xlsxData,
    days,
    progressBarsData,
  } = data;

  return (
    <GraphCard className="fullWidth dynamicHeight">
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            {formatMessage(messages.postFeedback)}
          </GraphCardTitle>
          <ReportExportMenu
            name={formatMessage(messages.postFeedback)
              .toLowerCase()
              .replace(' ', '_')}
            svgNode={[currentPieChart, currentProgressBarsChart]}
            xlsxData={xlsxData}
          />
        </GraphCardHeader>
        <Container>
          <RadarChartContainer>
            <PieChart
              data={pieData}
              mapping={{
                angle: 'value',
                name: 'name',
                fill: ({ row: { color } }) => color,
              }}
              pie={{
                innerRadius: '85%',
              }}
              centerLabel={({ viewBox: { cy } }) => (
                <CenterLabel
                  y={cy - 5}
                  value={pieCenterValue}
                  label={pieCenterLabel}
                />
              )}
              innerRef={currentPieChart}
            />
          </RadarChartContainer>
          <ProgressBarsContainer>
            <Box
              width="100%"
              maxWidth="256px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <ProgressBars
                height={136}
                data={progressBarsData}
                innerRef={currentProgressBarsChart}
              />
              <Box
                m="0 0 0 0"
                style={{
                  color: colors.adminTextColor,
                  fontSize: fontSizes.s,
                }}
                width="100%"
              >
                <Icon
                  name="calendar"
                  fill={colors.adminTextColor}
                  width="13px"
                  height="13px"
                  mr="11px"
                />
                {formatMessage(messages.averageTime, { days })}
              </Box>
            </Box>
          </ProgressBarsContainer>
        </Container>
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectIntl(PostFeedback);
