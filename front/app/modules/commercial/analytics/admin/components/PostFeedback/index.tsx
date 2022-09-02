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
import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import CenterLabel from './CenterLabel';
import { stackLabels } from './stackLabels';
// import Button from 'components/UI/Button';

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
import { getCornerRadius } from './utils';

// typings
import { InjectedIntlProps } from 'react-intl';

interface Props {
  projectId?: string;
  startAt?: string;
  endAt?: string;
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  min-height: 240px;

  ${media.smallerThan1100px`
    flex-direction: column;
  `}
`;

const DonutChartContainer = styled.div`
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
  startAt,
  endAt,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentPieChart = useRef();
  const currentProgressBarsChart = useRef();
  const data = usePostsWithFeedback(formatMessage, {
    projectId,
    startAt,
    endAt,
  });

  if (isNilOrError(data)) return null;

  const {
    pieData,
    progressBarsData,
    stackedBarsData,
    pieCenterValue,
    pieCenterLabel,
    days,
    stackedBarColumns,
    statusColorById,
    stackedBarPercentages,
    stackedBarsLegendItems,
    xlsxData,
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
          <DonutChartContainer>
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
          </DonutChartContainer>
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
        <Box width="100%" mt="30px" p="8px">
          <StackedBarChart
            data={stackedBarsData}
            height={80}
            mapping={{
              stackedLength: stackedBarColumns,
              fill: ({ stackIndex }) =>
                statusColorById[stackedBarColumns[stackIndex]],
              cornerRadius: getCornerRadius(stackedBarColumns.length, 5),
            }}
            layout="horizontal"
            labels={stackLabels(
              stackedBarsData,
              stackedBarColumns,
              stackedBarPercentages
            )}
            xaxis={{ hide: true, domain: [0, 'dataMax'] }}
            yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
            legend={{
              items: stackedBarsLegendItems,
              marginTop: 15,
            }}
          />
        </Box>
      </GraphCardInner>

      {/* <Button linkTo="/" /> */}
    </GraphCard>
  );
};

export default injectIntl(PostFeedback);
