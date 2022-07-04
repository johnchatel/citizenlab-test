import React, { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';

// components
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import SectionFormWrapper from './SectionFormWrapper';
import { Box, Button } from '@citizenlab/cl2-component-library';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc, CLError } from 'typings';

// resources
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';
import { updateAppConfiguration } from 'services/appConfiguration';

const HomepageCustomizableSection = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const appConfig = useAppConfiguration();
  const theme: any = useTheme();

  const [homePageInfoMultilocState, setHomePageInfoMultilocState] = useState<
    Multiloc | null | undefined
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(appConfig)) {
      setHomePageInfoMultilocState(
        appConfig.data.attributes.homepage_info_multiloc
      );
    }
  }, [appConfig]);

  const handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    setHomePageInfoMultilocState(homepageInfoPageMultiloc);
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      if (homePageInfoMultilocState) {
        await updateAppConfiguration({
          homepage_info_multiloc: homePageInfoMultilocState,
        });
      }
      setIsLoading(false);
    } catch (error) {
      if (isCLErrorJSON(error)) {
        setApiErrors(error.json.errors);
      } else {
        setApiErrors(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <SectionFormWrapper
      breadcrumbs={[
        { label: formatMessage(messages.title), linkTo: 'admin' },
        { label: formatMessage(messages.homeTitle), linkTo: 'pages-and-menu' },
        { label: formatMessage(messages.bottomInfoPageTitle) },
      ]}
      title="Bottom Info Section"
      stickyMenuContents={
        <Button disabled={isLoading} onClick={onSave}>
          Save Bottom Info Form
        </Button>
      }
    >
      <>
        <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
          <QuillMultilocWithLocaleSwitcher
            id="custom-section"
            label={formatMessage(messages.bottomInfoContentEditorTitle)}
            labelTooltipText={formatMessage(messages.bottomInfoDescription)}
            valueMultiloc={homePageInfoMultilocState}
            onChange={handleCustomSectionMultilocOnChange}
            withCTAButton
          />
        </Box>
        <Error apiErrors={apiErrors} />
      </>
    </SectionFormWrapper>
  );
};

export default injectIntl(HomepageCustomizableSection);
