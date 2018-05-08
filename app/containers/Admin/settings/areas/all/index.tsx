import React from 'react';
import styled from 'styled-components';
import { InjectedIntlProps } from 'react-intl';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { deleteArea } from 'services/areas';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

const ButtonWrapper = styled.div`
  margin-top: 2rem;
`;

interface InputProps {}

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps {}

class AreaList extends React.PureComponent<Props & InjectedIntlProps>{
  handleDeleteClick = (areaId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.areaDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteArea(areaId);
    }
  }

  render() {
    const areas = this.props.areas || [];
    const areasLength = areas.length;
    let lastItem = false;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
        <List>
          {areas && areas.map((area, index) => {
            if (index === areasLength - 1) lastItem = true;
            return (
              <Row key={area.id} lastItem={lastItem}>
                <TextCell className="expand">
                  <T value={area.attributes.title_multiloc}/>
                </TextCell>
                <Button
                  onClick={this.handleDeleteClick(area.id)}
                  style="text"
                  circularCorners={false}
                  icon="delete"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </Button>
                <Button
                  linkTo={`/admin/settings/areas/${area.id}`}
                  style="secondary"
                  circularCorners={false}
                  icon="edit"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
            </Row>
            );
          })
        }
        </List>
        <ButtonWrapper>
            <Button
              style="cl-blue"
              circularCorners={false}
              icon="plus-circle"
              linkTo="/admin/settings/areas/new"
            >
              <FormattedMessage {...messages.addAreaButton} />
            </Button>
          </ButtonWrapper>
      </Section>
    );
  }
}

const AreaListWithHoCs = injectIntl<Props>(AreaList);

export default () => (
  <GetAreas>
    {areas => (<AreaListWithHoCs areas={areas} />)}
  </GetAreas>
);
