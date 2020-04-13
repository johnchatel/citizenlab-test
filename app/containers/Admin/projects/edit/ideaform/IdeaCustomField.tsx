import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import CSSTransition from 'react-transition-group/CSSTransition';

// services
import { IIdeaCustomFieldData, IUpdatedIdeaCustomFieldProperties, Visibility } from 'services/ideaCustomFields';

// components
import Icon from 'components/UI/Icon';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import Radio from 'components/UI/Radio';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const timeout = 250;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-bottom: solid 1px ${colors.separation};

  &.first {
    border-top: solid 1px ${colors.separation};
  }
`;

const CustomFieldTitle = styled.div`
  flex: 1;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
`;

const ChevronIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${colors.label};
  margin-left: 20px;
  transition: fill 80ms ease-out,
              transform 200ms ease-out;
`;

const CollapsedContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;
  cursor: pointer;

  &.expanded {
    ${ChevronIcon} {
      transform: rotate(90deg);
    }
  }

  &:hover {
    ${ChevronIcon} {
      fill: #000;
    }
  }
`;

const CollapseContainer = styled.div`
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 200px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 200px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

const CollapseContainerInner = styled.div`
  padding-top: 25px;
  padding-bottom: 25px;
`;

interface Props {
  ideaCustomField: IIdeaCustomFieldData;
  collapsed: boolean;
  first?: boolean;
  onCollapseExpand: (ideaCustomFieldId: string) => void;
  onChange: (ideaCustomFieldId: string, updatedProperties: IUpdatedIdeaCustomFieldProperties) => void;
  className?: string;
}

const disablableFields = ['topic_ids', 'location', 'attachments'];
const requiredFields = ['title', 'body'];
const hidableFields = ['topic_ids', 'location', 'attachments'];

const IdeaCustomField = memo<Props>(({ ideaCustomField, collapsed, first, onChange, onCollapseExpand, className }) => {
  const canSetEnabled = disablableFields.find(field => field === ideaCustomField.attributes.key);
  const canSetOptional = !requiredFields.includes(ideaCustomField.attributes.key);
  const canSetHidden = hidableFields.find(field => field === ideaCustomField.attributes.key);

  const [descriptionMultiloc, setDescriptionMultiloc] = useState(ideaCustomField.attributes.description_multiloc);
  const [fieldEnabled, setFieldEnabled] = useState(ideaCustomField.attributes.enabled);
  const [fieldRequired, setFieldRequired] = useState(ideaCustomField.attributes.required);
  const [fieldVisibleTo, setFieldVisibleTo] = useState(ideaCustomField.attributes.visible_to);

  const handleDescriptionOnChange = useCallback((description_multiloc: Multiloc) => {
    setDescriptionMultiloc(description_multiloc);
    onChange(ideaCustomField.id, { description_multiloc });
  }, [ideaCustomField, onChange]);

  const handleEnabledOnChange = useCallback((enabled: boolean) => {
    setFieldEnabled(enabled);
    onChange(ideaCustomField.id, { enabled });
  }, [ideaCustomField, onChange]);

  const handleRequiredOnChange = useCallback((required: boolean) => {
    setFieldRequired(required);
    onChange(ideaCustomField.id, { required });
  }, [ideaCustomField, onChange]);

  const handleVisibleToOnChange = useCallback((visibleTo: Visibility) => {
    setFieldVisibleTo(visibleTo);
    onChange(ideaCustomField.id, { visible_to: visibleTo });
  }, [ideaCustomField, onChange]);

  const removeFocus = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleCollapseExpand = useCallback(() => {
    onCollapseExpand(ideaCustomField.id);
  }, [ideaCustomField]);

  if (!isNilOrError(ideaCustomField)) {
    const key = ideaCustomField.attributes.key;

    return (
      <Container className={`${className || ''} ${first ? 'first' : ''}`}>
        <CollapsedContent
          onMouseDown={removeFocus}
          onClick={handleCollapseExpand}
          className={collapsed ? 'collapsed' : 'expanded'}
        >
          <CustomFieldTitle>
            <T value={ideaCustomField.attributes.title_multiloc} />
          </CustomFieldTitle>
          <ChevronIcon name="chevron-right" />
        </CollapsedContent>

        <CSSTransition
          classNames="collapse"
          in={collapsed === false}
          timeout={timeout}
          mounOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <CollapseContainer>
            <CollapseContainerInner>
              {canSetEnabled && <>
                <Radio
                  onChange={handleEnabledOnChange}
                  currentValue={fieldEnabled}
                  value={true}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-enabled`}
                  className={`e2e-location-enabled ${fieldEnabled ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.enabled} />}
                />
                <Radio
                  onChange={handleEnabledOnChange}
                  currentValue={fieldEnabled}
                  value={false}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-disabled`}
                  className={`e2e-location-disabled ${!fieldEnabled ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.disabled} />}
                />
                {/* <Error apiErrors={apiErrors && apiErrors.presentation_mode} /> */}
              </>}

              {canSetOptional &&
              <>
                <Radio
                  onChange={handleRequiredOnChange}
                  currentValue={fieldRequired}
                  value={false}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-disabled`}
                  className={`e2e-location-disabled ${!fieldRequired ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.optional} />}
                />
                <Radio
                  onChange={handleRequiredOnChange}
                  currentValue={fieldRequired}
                  value={true}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-enabled`}
                  className={`e2e-location-enabled ${fieldRequired ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.required} />}
                />
                {/* <Error apiErrors={apiErrors && apiErrors.presentation_mode} /> */}
              </>
              }

            {canSetHidden &&
              <>
                <Radio
                  onChange={handleVisibleToOnChange}
                  currentValue={fieldVisibleTo}
                  value={'public'}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-disabled`}
                  // className={`e2e-location-disabled ${!visibleTo ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.everyone} />}
                />
                <Radio
                  onChange={handleVisibleToOnChange}
                  currentValue={fieldVisibleTo}
                  value={'admin'}
                  name={`${key}-field-enabled`}
                  id={`${key}-field-enabled`}
                  // className={`e2e-location-enabled ${visibleTo ? 'selected' : ''}`}
                  label={<FormattedMessage {...messages.admin} />}
                />
                {/* <Error apiErrors={apiErrors && apiErrors.presentation_mode} /> */}
              </>
              }

              <TextAreaMultilocWithLocaleSwitcher
                label={<FormattedMessage {...messages.descriptionLabel} />}
                valueMultiloc={descriptionMultiloc}
                onChange={handleDescriptionOnChange}
                rows={3}
              />
            </CollapseContainerInner>
          </CollapseContainer>
        </CSSTransition>
      </Container>
    );
  }

  return null;
});

export default IdeaCustomField;

// .selected class of enabled radios
// e2e test of enabled field toggle
