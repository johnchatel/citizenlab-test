import React, { useRef } from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import Footer from './Footer';
import { LabelList, Tooltip } from 'recharts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// data
import { TEST_GENDER_DATA, GENDER_DEMO_DATA_DATE } from './data';

interface RepresentativenessRow {
  name: string;
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}

interface Props {
  customField: IUserCustomFieldData;
}

interface TooltipProps {
  dataKey?: 'actualPercentage' | 'referencePercentage';
  payload?: RepresentativenessRow;
}

const formatPercentage = (percentage: number) => `${percentage}%`;
const formatTooltipValues = (_, __, tooltipProps?: TooltipProps) => {
  if (!tooltipProps) return '?';

  const { dataKey, payload } = tooltipProps;
  if (!dataKey || !payload) return '?';

  const {
    actualPercentage,
    referencePercentage,
    actualNumber,
    referenceNumber,
  } = payload;

  return dataKey === 'actualPercentage'
    ? `${actualPercentage}% (${actualNumber})`
    : `${referencePercentage}% (${referenceNumber})`;
};

const getLegendLabels = (barNames: string[]) => [
  barNames[0],
  `${barNames[1]} (${GENDER_DEMO_DATA_DATE.format('MMMM YYYY')})`,
];

const emptyString = () => '';

const ChartCard = ({
  customField,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();
  const currentChartRef = useRef<SVGElement>();

  const dataIsTooLong = TEST_GENDER_DATA.length > 24;
  const data = dataIsTooLong ? TEST_GENDER_DATA.slice(0, 24) : TEST_GENDER_DATA;
  const numberOfHiddenItems = TEST_GENDER_DATA.length - 24;

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  const legendLabels = getLegendLabels(barNames);

  return (
    <Box width="100%" background="white">
      <Header
        titleMultiloc={customField.attributes.title_multiloc}
        svgNode={currentChartRef}
      />
      <MultiBarChart
        height={300}
        innerRef={currentChartRef}
        data={data}
        mapping={{ length: ['actualPercentage', 'referencePercentage'] }}
        bars={{
          name: barNames,
          fill: [newBarFill, secondaryNewBarFill],
        }}
        margin={DEFAULT_BAR_CHART_MARGIN}
        xaxis={data.length > 12 ? { tickFormatter: emptyString } : undefined}
        yaxis={{ tickFormatter: formatPercentage }}
        renderLabels={
          data.length > 10
            ? undefined
            : (props) => <LabelList {...props} formatter={formatPercentage} />
        }
        renderTooltip={(props) => (
          <Tooltip {...props} formatter={formatTooltipValues} />
        )}
      />
      <Footer
        fieldIsRequired={customField.attributes.required}
        dataIsTooLong={dataIsTooLong}
        numberOfHiddenItems={numberOfHiddenItems}
        legendLabels={legendLabels}
        legendColors={[newBarFill, secondaryNewBarFill]}
      />
    </Box>
  );
};

export default injectIntl(ChartCard);
