import React, { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import streams from 'utils/streams';

// services
import { updateUser } from 'services/users';
import GetLockedFields, {
  GetLockedFieldsChildProps,
} from 'resources/GetLockedFields';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// components
// import PasswordInput, {
//   hasPasswordMinimumLength,
// } from 'components/UI/PasswordInput';
// import PasswordInputIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { SectionField } from 'components/admin/Section';
import {
  FormSection,
  // FormLabel,
  FormSectionTitle,
} from 'components/UI/FormComponents';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, mixed } from 'yup';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import { IconTooltip, Box, Button } from '@citizenlab/cl2-component-library';

// i18n
import { appLocalePairs, API_PATH } from 'containers/App/constants';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';

// typings
import { IOption, UploadFile, Multiloc } from 'typings';

import Outlet from 'components/Outlet';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import eventEmitter from 'utils/eventEmitter';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

// const StyledPasswordInputIconTooltip = styled(PasswordInputIconTooltip)`
//   margin-bottom: 4px;
// `;

// Types
interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  lockedFields: GetLockedFieldsChildProps;
  disableBio: GetFeatureFlagChildProps;
}

export type ExtraFormDataKey = 'custom_field_values';

type Props = InputProps & DataProps & InjectedIntlProps & InjectedLocalized;

type FormValues = {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio_multiloc?: Multiloc;
  locale?: string;
  avatar?: UploadFile[];
};

const ProfileForm = ({
  intl: { formatMessage },
  disableBio,
  tenantLocales,
  lockedFields,
  authUser,
}: Props) => {
  const localeOptions: IOption[] = tenantLocales.map((locale) => ({
    value: locale,
    label: appLocalePairs[locale],
  }));

  const [extraFormData, setExtraFormData] = useState<{
    [field in ExtraFormDataKey]?: Record<string, any>;
  }>({});

  const schema = object({
    first_name: string().required(),
    last_name: string().required(),
    email: string().email().required(),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    locale: string(),
    avatar: mixed(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      first_name: authUser?.attributes.first_name,
      last_name: authUser?.attributes.last_name || undefined,
      email: authUser?.attributes.email,
      bio_multiloc: authUser?.attributes.bio_multiloc,
      locale: authUser?.attributes.locale,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isNilOrError(authUser)) return;
    const avatarUrl =
      authUser.attributes.avatar && authUser.attributes.avatar.medium;
    if (avatarUrl) {
      convertUrlToUploadFile(avatarUrl, null, null).then((fileAvatar) => {
        if (fileAvatar) {
          methods.setValue('avatar', [fileAvatar]);
        }
      });
    }
  }, [authUser, methods]);

  if (isNilOrError(authUser)) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    const avatar = formValues.avatar ? formValues.avatar[0].base64 : null;
    // Add custom fields values to form
    const newFormValues = Object.entries(extraFormData).reduce(
      (acc, [key, extraFormDataConfiguration]) => {
        return {
          ...acc,
          [key]: extraFormDataConfiguration?.formData,
        };
      },
      formValues
    );

    eventEmitter.emit('customFieldsSubmitEvent');
    Object.values(extraFormData).forEach((configuration) => {
      configuration?.submit?.();
    });

    try {
      await updateUser(authUser.id, { ...newFormValues, avatar });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/onboarding_campaigns/current`],
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // const { hasPasswordMinimumLengthError } = state;

  const lockedFieldsNames = isNilOrError(lockedFields)
    ? []
    : lockedFields.map((field) => field.attributes.name);

  const handleFormOnChange = ({
    key,
    formData,
  }: {
    key: ExtraFormDataKey;
    formData: Record<string, any>;
  }) => {
    setExtraFormData({
      ...extraFormData,
      [key]: { ...(extraFormData?.[key] ?? {}), formData },
    });
  };

  // const handlePasswordOnChange = (password: string) => {
  //   const { tenant } = props;

  //   setState({
  //     hasPasswordMinimumLengthError: hasPasswordMinimumLength(
  //       password,
  //       !isNilOrError(tenant)
  //         ? tenant.attributes.settings.password_login?.minimum_length
  //         : undefined
  //     ),
  //   });
  //   setFieldValue('password', password);
  // };

  // const createBlurHandler = (fieldName: string) => () => {
  //   setFieldTouched(fieldName);
  // };

  return (
    <FormSection>
      <FormProvider {...methods}>
        <form>
          <FormSectionTitle
            message={messages.h1}
            subtitleMessage={messages.h1sub}
          />
          <SectionField>
            <Feedback successMessage={formatMessage(messages.messageSuccess)} />
          </SectionField>
          <SectionField>
            <ImagesDropzone
              name="avatar"
              imagePreviewRatio={1}
              maxImagePreviewWidth="170px"
              acceptedFileTypes={{
                'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
              }}
              label={formatMessage(messages.imageDropzonePlaceholder)}
              inputLabel={formatMessage(messages.image)}
              removeIconAriaTitle={formatMessage(
                messages.a11y_imageDropzoneRemoveIconAriaTitle
              )}
              borderRadius="50%"
            />
          </SectionField>

          <SectionField>
            <Input
              type="text"
              name="first_name"
              label={formatMessage(messages.firstNames)}
              autocomplete="given-name"
              disabled={lockedFieldsNames.includes('first_name')}
            />
            {lockedFieldsNames.includes('first_name') && (
              <StyledIconTooltip
                content={<FormattedMessage {...messages.blockedVerified} />}
                icon="lock"
              />
            )}
          </SectionField>

          <SectionField>
            <Input
              type="text"
              name="last_name"
              label={formatMessage(messages.lastName)}
              autocomplete="family-name"
              disabled={lockedFieldsNames.includes('last_name')}
            />
            {lockedFieldsNames.includes('last_name') && (
              <StyledIconTooltip
                content={<FormattedMessage {...messages.blockedVerified} />}
                icon="lock"
              />
            )}
          </SectionField>

          <SectionField>
            <Input
              type="email"
              name="email"
              label={formatMessage(messages.email)}
              autocomplete="email"
              disabled={lockedFieldsNames.includes('email')}
            />
            {lockedFieldsNames.includes('email') && (
              <StyledIconTooltip
                content={<FormattedMessage {...messages.blockedVerified} />}
                icon="lock"
              />
            )}
          </SectionField>

          {!disableBio && (
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name="bio_multiloc"
                noImages
                noVideos
                limitedTextFormatting
                label={formatMessage(messages.bio)}
              />
            </SectionField>
          )}

          {/* <SectionField>
            <LabelContainer>
              <FormLabel
                width="max-content"
                margin-right="5px"
                labelMessage={messages.password}
                htmlFor="password"
              />
              <StyledPasswordInputIconTooltip />
            </LabelContainer>
            <PasswordInput
              id="password"
              password={values.password}
              onChange={handlePasswordOnChange}
              onBlur={createBlurHandler('password')}
              errors={{ minimumLengthError: hasPasswordMinimumLengthError }}
            />
          </SectionField> */}

          <SectionField>
            <Select
              name="locale"
              options={localeOptions}
              label={formatMessage(messages.language)}
            />
          </SectionField>
        </form>
        <Outlet
          id="app.containers.UserEditPage.ProfileForm.forms"
          onChange={handleFormOnChange}
          authUser={authUser}
        />
        <Box display="flex">
          <Button
            type="submit"
            processing={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onFormSubmit)}
          >
            {formatMessage(messages.submit)}
          </Button>
        </Box>
      </FormProvider>
    </FormSection>
  );
};

const ProfileFormWithHocs = injectIntl(localize(ProfileForm));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetAppConfiguration />,
  lockedFields: <GetLockedFields />,
  disableBio: <GetFeatureFlag name="disable_user_bios" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProfileFormWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
