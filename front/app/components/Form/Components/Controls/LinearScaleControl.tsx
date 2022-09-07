import React from 'react';

// JSON forms
import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

// Components
import { Box, Text, Radio } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import VerificationIcon from '../VerificationIcon';
import ErrorDisplay from '../ErrorDisplay';

const LinearScaleControl = ({
  data,
  path,
  errors,
  schema,
  uischema,
  required,
  handleChange,
  id,
}: ControlProps) => {
  const maximum = schema?.properties?.rating?.maximum;

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" gap="8px" overflow="visible">
        <Text mt="42px" mr="8px" fontWeight="bold">
          {uischema.options?.minimum_label}
        </Text>
        <>
          {[...Array(maximum)].map((x, i) => (
            <Box key={i} style={{ lineHeight: '0px' }}>
              <Text mb="4px" ml="4px">
                {i + 1}
              </Text>
              <br />
              <Radio
                name="linear_scale"
                currentValue={data?.rating}
                value={i + 1}
                key={i}
                id={x}
                onChange={(value) => handleChange(path, { rating: value })}
              />
            </Box>
          ))}
        </>
        <Text mt="42px" fontWeight="bold">
          {uischema.options?.maximum_label}
        </Text>
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={false} />
    </>
  );
};

export default withJsonFormsControlProps(LinearScaleControl);

export const linearScaleControlTester: RankedTester = rankWith(
  10,
  scopeEndsWith('linear_scale')
);
