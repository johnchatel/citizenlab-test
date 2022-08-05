import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NativeSurveyFooter from '../NativeSurveyFooter';
import NativeSurveyForm from '../NativeSurveyForm';

// style
import { stylingConsts, colors } from 'utils/styleUtils';

const NativeSurveyLayout = () => {
  return (
    <>
      <Box
        width="100%"
        minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight - 12}px)`}
        flexDirection="column"
        display="flex"
        alignItems="center"
        bgColor={colors.background}
        flexWrap="wrap"
      >
        <NativeSurveyForm />
      </Box>
      <Box position="fixed" width="100%" bottom="0px" zIndex="9999">
        <NativeSurveyFooter />
      </Box>
    </>
  );
};

export default NativeSurveyLayout;
