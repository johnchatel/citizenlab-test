import React, { useRef } from 'react';

// components
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  Box,
  Icon,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';
import CenterLabel from './CenterLabel';

// styling
import { colors } from 'utils/styleUtils';

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

const PostFeedback = ({
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentPieChart = useRef();
  const currentProgressBarsChart = useRef();
  const data = usePostsWithFeedback(formatMessage, projectId);
  const largeTablet = useBreakpoint('largeTablet');

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
        <Box
          display="flex"
          justifyContent="space-around"
          width="100%"
          flexDirection={largeTablet ? 'column' : 'row'}
          alignItems={largeTablet ? 'center' : 'flex-start'}
        >
          <Box maxWidth="210px" width="50%">
            <PieChart
              height={210}
              width="100%"
              data={pieData}
              mapping={{
                angle: 'value',
                name: 'name',
                fill: ({ row: { color } }) => color,
              }}
              pie={{
                innerRadius: '65%',
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
          </Box>
          <Box
            maxWidth="257px"
            width="50%"
            mt={largeTablet ? '0px' : '24px'}
            display="flex"
            flexDirection="column"
            alignItems={largeTablet ? 'center' : 'flex-start'}
          >
            <ProgressBars
              data={progressBarsData}
              width="100%"
              height={136}
              innerRef={currentProgressBarsChart}
            />
            <Text m="-2px 0 0 0" color="adminTextColor" fontSize="s">
              <Icon
                name="calendar"
                fill={colors.adminTextColor}
                width="13px"
                height="13px"
                mr="11px"
              />
              {formatMessage(messages.averageTime, { days })}
            </Text>
          </Box>
        </Box>
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectIntl(PostFeedback);
