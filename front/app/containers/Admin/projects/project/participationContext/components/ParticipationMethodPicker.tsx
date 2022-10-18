import React from 'react';

// components
import { IconTooltip, Radio, Text } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import FeatureFlag from 'components/FeatureFlag';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import { LabelHeaderDescription } from './labels';
import { ParticipationMethodRadio } from './styling';

// i18n
import messages from '../../messages';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { ApiErrors } from '..';
import { getMethodConfig } from 'utils/participationMethodUtils';

interface Props {
  participation_method: ParticipationMethod;
  showSurveys: boolean;
  apiErrors: ApiErrors;
  handleParticipationMethodOnChange: (
    participation_method: ParticipationMethod
  ) => void;
}

export const ParticipationMethodPicker = ({
  participation_method,
  showSurveys,
  apiErrors,
  handleParticipationMethodOnChange,
}: Props) => {
  const config = getMethodConfig(participation_method);
  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.participationMethodTitleText} />
        {!config.methodIsLocked && (
          <IconTooltip
            content={
              <FormattedMessage {...messages.participationMethodTooltip} />
            }
          />
        )}
      </SubSectionTitle>
      {!config.methodIsLocked && (
        <>
          <ParticipationMethodRadio
            onChange={handleParticipationMethodOnChange}
            currentValue={participation_method}
            value="ideation"
            name="participationmethod"
            id="participationmethod-ideation"
            label={
              <LabelHeaderDescription
                header={<FormattedMessage {...messages.inputAndFeedback} />}
                description={
                  <FormattedMessage {...messages.inputAndFeedbackDescription} />
                }
              />
            }
          />
          <FeatureFlag name="participatory_budgeting">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="budgeting"
              name="participationmethod"
              id={'participationmethod-budgeting'}
              label={
                <LabelHeaderDescription
                  header={
                    <FormattedMessage
                      {...messages.conductParticipatoryBudgetingText}
                    />
                  }
                  description={
                    <FormattedMessage
                      {...messages.conductParticipatoryBudgetingDescriptionText}
                    />
                  }
                />
              }
            />
          </FeatureFlag>
          <FeatureFlag name="polls">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="poll"
              name="participationmethod"
              id={'participationmethod-poll'}
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.createPoll} />}
                  description={
                    <FormattedMessage {...messages.createPollDescription} />
                  }
                />
              }
            />
          </FeatureFlag>
          <FeatureFlag name="native_surveys">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="native_survey"
              name="participationmethod"
              id={'participationmethod-native_survey'}
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.createNativeSurvey} />}
                  description={
                    <FormattedMessage
                      {...messages.createNativeSurveyDescription}
                    />
                  }
                />
              }
            />
          </FeatureFlag>

          {showSurveys && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="survey"
              name="participationmethod"
              id={'participationmethod-survey'}
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.createSurveyText} />}
                  description={
                    <FormattedMessage {...messages.createSurveyDescription} />
                  }
                />
              }
            />
          )}

          <FeatureFlag name="volunteering">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="volunteering"
              name="participationmethod"
              id={'participationmethod-volunteering'}
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.findVolunteers} />}
                  description={
                    <FormattedMessage
                      {...messages.findVolunteersDescriptionText}
                    />
                  }
                />
              }
            />
          </FeatureFlag>
          <Radio
            onChange={handleParticipationMethodOnChange}
            currentValue={participation_method}
            value="information"
            name="participationmethod"
            id="participationmethod-information"
            label={
              <LabelHeaderDescription
                header={<FormattedMessage {...messages.shareInformation} />}
                description={
                  <FormattedMessage {...messages.shareInformationDescription} />
                }
              />
            }
          />
          <Error apiErrors={apiErrors && apiErrors.participation_method} />
        </>
      )}
      {config.methodIsLocked && (
        <Text margin="0" color="teal700">
          {config.getMethodPickerMessage()}
        </Text>
      )}
    </SectionField>
  );
};
