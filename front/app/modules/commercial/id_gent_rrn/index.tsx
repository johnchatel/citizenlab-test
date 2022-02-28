import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import GentRrnButton from './components/GentRrnButton';
import VerificationFormGentRrn from './components/VerificationFormGentRrn';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'gent_rrn';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      onClick,
      ...otherProps
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        const onMethodSelected = () => onClick(verificationMethodName);
        return (
          <GentRrnButton
            method={method}
            last={last}
            onMethodSelected={onMethodSelected}
            {...otherProps}
          />
        );
      }

      return null;
    },
    'app.components.VerificationModal.methodSteps': ({
      method,
      activeStep,
      ...otherProps
    }) => {
      if (
        method?.attributes.name === verificationMethodName &&
        activeStep === 'method-step'
      ) {
        return <VerificationFormGentRrn method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
