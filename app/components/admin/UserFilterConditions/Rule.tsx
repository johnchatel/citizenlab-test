import * as React from 'react';
import { pick, clone } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';

import Button from 'components/UI/Button';
import FieldSelector, { FieldDescriptor } from './FieldSelector';
// import messages from './messages';

const Container = styled.div`

`;

type Props = {
  rule: TRule;
  onChange: (rule: TRule) => void;
  onRemove: () => void;
};

type State = {};

class Rule extends React.Component<Props, State> {

  handleChangeField = (fieldDescriptor: FieldDescriptor) => {
    const newRule = clone(fieldDescriptor) as TRule;
    this.props.onChange(newRule);
  }

  fieldDescriptorFromRule = (rule: TRule): FieldDescriptor => {
    return pick(rule, ['ruleType', 'customFieldId']);
  }

  render() {
    const { rule, onRemove } = this.props;
    return (
      <Container>
        <Button
          onClick={onRemove}
          icon="delete"
        />
        <FieldSelector
          field={this.fieldDescriptorFromRule(rule)}
          onChange={this.handleChangeField}
        />
      </Container>
    );
  }
}

export default Rule;
