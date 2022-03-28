import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';

// services
import { addTextingCampaign } from 'services/textingCampaigns';

// utils
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledForm = styled.form`
  width: 500px;
`;

// enough to fit 3 messages, actual functionality TBD in subsequent ticket
const MAX_CHAR_COUNT = 480;

const TextCreation = () => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState<string | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

  const handleInputPhoneNumbersChange = (value: string | null) => {
    setInputPhoneNumbers(value);
  };

  const handleInputMessageChange = (value: string) => {
    setInputMessage(value);
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNilOrError(inputMessage) || isNilOrError(inputPhoneNumbers)) return;

    const splitNumbers = inputPhoneNumbers.split(',');
    try {
      const result = await addTextingCampaign(inputMessage, splitNumbers);
      const { id } = result.data;
      const url = `/admin/messaging/texting/${id}/preview`;
      clHistory.replace(url);
    } catch (error) {
      // handle error here in subsequent ticket
      // console.log('something broke', error);
    }
  };

  useEffect(() => {
    if (isNilOrError(inputMessage)) {
      setRemainingChars(MAX_CHAR_COUNT);
      return;
    }

    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  const isSubmitButtonEnabled =
    !isNilOrError(inputMessage) &&
    !isNilOrError(inputPhoneNumbers) &&
    inputMessage.length > 0 &&
    inputPhoneNumbers.length > 0;

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <Section>
        <SectionField>
          <TextingHeader
            headerMessage="New SMS campaign"
            onClickGoBack={clHistory.goBack}
          />
        </SectionField>
        <StyledForm onSubmit={handleOnSubmit}>
          <SectionField>
            <Label>
              Enter a list of phone numbers. Separate each number by a comma and
              include the international dialing code (eg. +1).
            </Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputPhoneNumbers}
              onChange={handleInputPhoneNumbersChange}
            />
          </SectionField>
          <SectionField>
            <Label>
              Message <IconTooltip content="Help goes here" />
            </Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputMessage}
              onChange={handleInputMessageChange}
            />
            {remainingChars} characters remaining
          </SectionField>

          <SectionField>
            <Box maxWidth="250px">
              <Button
                buttonStyle="primary"
                size="2"
                type="submit"
                text={'Preview SMS'}
                onClick={handleOnSubmit}
                disabled={!isSubmitButtonEnabled}
              />
            </Box>
          </SectionField>
        </StyledForm>
      </Section>
    </>
  );
};

export default TextCreation;