import React, { useState } from 'react';
import styled from 'styled-components';
import getSubmitState from 'utils/getSubmitState';
import { isCLErrorJSON } from 'utils/errorUtils';
import { CLError, Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

import {
  IAppConfigurationSettings,
  IUpdatedAppConfigurationProperties,
  updateAppConfiguration,
  TAppConfigurationSettingCore,
  TAppConfigurationSetting,
} from 'services/appConfiguration';

// components
import messages from 'containers/Admin/settings/messages';

import {
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import Outlet from 'components/Outlet';

export const LabelTooltip = styled.div`
  display: flex;
`;

const SignUpFieldsSection = styled.div`
  margin-bottom: 60px;
`;

interface Props {}

const SettingsRegistrationTab = (_props: Props) => {
  const appConfig = useAppConfiguration();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [errors, setErrors] = useState<{ [fieldName: string]: CLError[] }>({});
  const [attributesDiff, setAttributesDiff] =
    useState<IUpdatedAppConfigurationProperties>({});

  const handleCoreSettingWithMultilocOnChange =
    (coreSetting: TAppConfigurationSettingCore) => (multiloc: Multiloc) => {
      setAttributesDiff({
        ...attributesDiff,
        settings: {
          ...(attributesDiff.settings || {}),
          core: {
            ...(attributesDiff.settings?.core || {}),
            [coreSetting]: multiloc,
          },
        },
      });
    };

  const handleSettingOnChange =
    (setting: TAppConfigurationSetting) => (value: any) => {
      const newAttributesDiff = { ...(attributesDiff || { settings: {} }) };
      setAttributesDiff({
        ...newAttributesDiff,
        settings: {
          ...(newAttributesDiff.settings || {}),
          [setting]: value,
        },
      });
    };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }

    setIsFormSubmitting(true);
    setIsFormSaved(false);

    try {
      await updateAppConfiguration(
        attributesDiff as IUpdatedAppConfigurationProperties
      );

      setIsFormSubmitting(false);
      setIsFormSaved(true);
      setAttributesDiff({});
    } catch (error) {
      setIsFormSubmitting(false);
      setErrors(isCLErrorJSON(error) ? error.json.errors : error);
    }
  };

  if (!isNilOrError(appConfig)) {
    const latestAppConfigSettings = {
      ...appConfig.data.attributes.settings,
      ...attributesDiff.settings,
    };

    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.registrationTitle} />
        </SectionTitle>
        <SignUpFieldsSection key={'signup_fields'}>
          <SubSectionTitle>
            <FormattedMessage {...messages.signupFormText} />
          </SubSectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.registrationHelperTextDescription} />
          </SectionDescription>
          <form onSubmit={handleSubmit}>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  latestAppConfigSettings?.core.signup_helper_text || null
                }
                onChange={handleCoreSettingWithMultilocOnChange(
                  'signup_helper_text'
                )}
                label={
                  <LabelTooltip>
                    <FormattedMessage {...messages.step1} />
                    <IconTooltip
                      content={<FormattedMessage {...messages.step1Tooltip} />}
                    />
                  </LabelTooltip>
                }
              />
            </SectionField>
            <Outlet
              id="app.containers.Admin.settings.registrationSectionEnd"
              onSettingChange={handleSettingOnChange}
              onCoreSettingWithMultilocChange={
                handleCoreSettingWithMultilocOnChange
              }
              customFieldsSignupHelperTextMultiloc={
                latestAppConfigSettings.core.custom_fields_signup_helper_text
              }
              userConfirmationSetting={
                latestAppConfigSettings.user_confirmation
              }
            />
            <SubmitWrapper
              loading={isFormSubmitting}
              status={getSubmitState({
                errors,
                saved: isFormSaved,
                diff: attributesDiff,
              })}
              messages={{
                buttonSave: messages.save,
                buttonSuccess: messages.saveSuccess,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </form>
        </SignUpFieldsSection>
        <Outlet id="app.containers.Admin.settings.registrationTabEnd" />
      </>
    );
  }

  return null;
};

export default SettingsRegistrationTab;
