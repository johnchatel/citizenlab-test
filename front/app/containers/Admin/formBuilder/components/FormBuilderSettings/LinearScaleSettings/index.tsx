import React, { useState, useEffect, useCallback } from 'react';

// react hook form
import { Controller, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  IconTooltip,
  LocaleSwitcher,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc, Locale } from 'typings';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
interface Props {
  name: string;
  maximumName: string;
  minimumLabelName: string;
  maximumLabelName: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
}

const LinearScaleSettings = ({
  onSelectedLocaleChange,
  name,
  maximumName,
  minimumLabelName,
  maximumLabelName,
  locales,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const {
    // formState: { errors }, // TODO: Error handling
    control,
    setValue,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(locales[0]);
    onSelectedLocaleChange?.(locales[0]);
  }, [locales, onSelectedLocaleChange]);
  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  const defaultValues = [{}];

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={maximumName}
          control={control}
          defaultValue={defaultValues}
          render={({ field: { ref: _ref, value } }) => {
            return (
              <SectionField>
                <Box marginBottom="8px">
                  <Label>
                    {formatMessage(messages.range)}
                    <IconTooltip
                      content={formatMessage(messages.rangeTooltip)}
                    />
                  </Label>
                  <Box>
                    <Text>{formatMessage(messages.rangeToLabel)}</Text>
                    <Box width="60px">
                      <Input
                        type="number"
                        value={value}
                        onChange={(value) => {
                          setValue(maximumName, value);
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" flexWrap="wrap" marginBottom="12px">
                  <Box marginTop="4px" marginRight="12px">
                    <Label>
                      {formatMessage(messages.labels)}
                      <IconTooltip
                        content={formatMessage(messages.labelsTooltip)}
                      />
                    </Label>
                  </Box>
                  <Box>
                    <LocaleSwitcher
                      onSelectedLocaleChange={handleOnSelectedLocaleChange}
                      locales={!isNilOrError(locales) ? locales : []}
                      selectedLocale={selectedLocale}
                      values={{
                        input_field: value as Multiloc,
                      }}
                    />
                  </Box>
                </Box>
                <Controller
                  name={minimumLabelName}
                  control={control}
                  defaultValue={defaultValues}
                  render={({ field: { ref: _ref, value } }) => {
                    return (
                      <Input
                        type="text"
                        value={value}
                        onChange={(value) => {
                          setValue(minimumLabelName, value);
                        }}
                      />
                    );
                  }}
                />
                <Controller
                  name={maximumLabelName}
                  control={control}
                  defaultValue={defaultValues}
                  render={({ field: { ref: _ref, value } }) => {
                    return (
                      <Input
                        type="text"
                        value={value}
                        onChange={(value) => {
                          setValue(name, value);
                        }}
                      />
                    );
                  }}
                />
              </SectionField>
            );
          }}
        />
      </>
    );
  }
  return null;
};

export default injectIntl(LinearScaleSettings);
