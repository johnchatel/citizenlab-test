import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { postingButtonState } from 'services/ideaPostingRules';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { PostingDisabledReasons } from 'services/projects';

const DisabledText = styled.div`
  color: rgba(121, 137, 147, 1);
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
`;

interface InputProps {
  projectId: string;
  phaseId?: string;
  onClick?: () => void;
}

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaButton extends React.PureComponent<Props, State> {

  disabledMessages: { [key in PostingDisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor} = {
    project_inactive: messages.postingHereImpossible,
    not_ideation: messages.postingHereImpossible,
    posting_disabled: messages.postingHereImpossible,
    not_permitted: messages.postingNotPermitted,
  };

  handleOnAddIdeaClick = () => {
    this.props.onClick && this.props.onClick();
  }

  render() {
    const { project, phase } = this.props;

    if (isNilOrError(project)) return null;

    const { show, enabled, disabledReason } = postingButtonState({ project, phaseContext: phase });

    if (!show || !enabled) {
      return (
        <DisabledText>
          <StyledIcon name="lock-outlined" />
          {disabledReason ?
            <FormattedMessage {...this.disabledMessages[disabledReason]} />
          :
            <FormattedMessage {...messages.postingHereImpossible} />
          }
        </DisabledText>
      );
    }

    return (
      <Button
        onClick={this.props.onClick}
        icon="plus-circle"
        style="primary"
        size="2"
        text={<FormattedMessage {...messages.postIdeaHere} />}
        circularCorners={false}
        disabled={!enabled}
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaButton {...inputProps} {...dataProps} />}
  </Data>
);
