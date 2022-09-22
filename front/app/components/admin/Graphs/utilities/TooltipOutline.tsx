import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  children: React.ReactNode;
}

const TooltipOutline = ({ label, children }: Props) => (
  <Box
    background="white"
    px="8px"
    py="8px"
    border={`1px solid ${colors.separation}`}
  >
    <Text
      color="adminTextColor"
      fontWeight="bold"
      textAlign="center"
      fontSize="s"
      mt="0px"
      mb="8px"
    >
      {label}
    </Text>

    {children}
  </Box>
);

export default TooltipOutline;
