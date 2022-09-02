import React, { useState, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Icon from './Icon';

// utils
import { getJustifyContent, getLegendDimensions } from './utils';
import { isEqual } from 'lodash-es';

// typings
import { Position, LegendItem, LegendDimensions } from './typings';
import { Percentage } from 'typings';

interface Props {
  width?: number | Percentage;
  items: LegendItem[];
  position?: Position;
  onCalculateDimensions: (dimensions: LegendDimensions) => void;
}

let idNumber = 0;

const getId = () => {
  const id = `_fake-legend-${idNumber}`;
  idNumber++;
  return id;
};

const FakeLegend = ({
  width,
  items,
  position = 'bottom-center',
  onCalculateDimensions,
}: Props) => {
  const [id, setId] = useState<string | undefined>();
  const [legendDimensions, setLegendDimensions] = useState<
    LegendDimensions | undefined
  >();
  const [calculationScheduled, setCalculationScheduled] = useState(false);

  const calculateDimensions = () => {
    if (id === undefined) return;

    const items = [...document.querySelectorAll(`#${id} > .fake-legend-item`)];

    const newLegendDimensions = getLegendDimensions(items);

    if (!isEqual(legendDimensions, newLegendDimensions)) {
      setLegendDimensions(newLegendDimensions);
      onCalculateDimensions(newLegendDimensions);
    }

    setCalculationScheduled(false);
  };

  const scheduleCalculation = () => setCalculationScheduled(true);

  const { ref: resizeRef } = useResizeDetector({
    onResize: scheduleCalculation,
  });

  useEffect(() => {
    scheduleCalculation();
  }, [items, position]);

  useEffect(() => {
    setId(getId());
    scheduleCalculation();
  }, []);

  // This is just to make sure that the component finishes
  // rendering before calculateDimensions is called. Without this,
  // react complains about two components rendering at the same time
  // or something
  useEffect(() => {
    if (!calculationScheduled) return;
    calculateDimensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationScheduled]);

  const stringWidth =
    typeof width === 'number' ? `${width}px` : width ?? '100%';

  const handleRef = (ref: HTMLDivElement | null) => {
    if (ref === null) return;
    resizeRef.current = ref;
  };

  return (
    <Box
      style={{ visibility: 'hidden' }}
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent={getJustifyContent(position)}
      id={id}
      width={stringWidth}
      ref={handleRef}
    >
      {items.map((item, i) => (
        <Box
          className="fake-legend-item"
          display="flex"
          flexDirection="row"
          alignItems="center"
          px="4px"
          key={i}
          maxWidth="100%"
        >
          <svg width="14px" height="14px" style={{ marginRight: '4px' }}>
            <Icon {...item} />
          </svg>

          <Box style={{ fontSize: '14px' }} display="flex" alignItems="center">
            {item.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FakeLegend;
