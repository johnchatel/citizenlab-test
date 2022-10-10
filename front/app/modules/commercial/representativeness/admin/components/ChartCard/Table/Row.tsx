import React from 'react';

// components
import { Row, Cell } from 'components/admin/Table';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { SEMANTIC_UI_HEADER_BG_COLOR } from 'components/admin/Table/constants';

// utils
import { formatPercentage } from '../utils';

// typings
import { RepresentativenessRow } from '../../../hooks/createRefDataSubscription';

const AbsoluteValue = styled.span`
  color: ${colors.textSecondary};
  margin-left: 4px;
`;

interface Props {
  row: RepresentativenessRow;
}

const RowComponent = ({ row }: Props) => {
  return (
    <Row>
      <Cell p="12px" background={SEMANTIC_UI_HEADER_BG_COLOR}>
        {row.name}
      </Cell>
      <Cell p="12px">
        {formatPercentage(row.actualPercentage)}
        <AbsoluteValue>
          ({row.actualNumber.toLocaleString('en-US')})
        </AbsoluteValue>
      </Cell>
      <Cell p="12px">
        {formatPercentage(row.referencePercentage)}
        <AbsoluteValue>
          ({row.referenceNumber.toLocaleString('en-US')})
        </AbsoluteValue>
      </Cell>
    </Row>
  );
};

export default RowComponent;
