import React from 'react';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';
import { Checkbox } from 'cl2-component-library';
import T from 'components/T';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import styled from 'styled-components';

const TagList = styled.div`
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

type InputsTableRow = {
  input: IInsightsInputData;
};

const InputsTableRow = ({ input }: InputsTableRow) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }
  return (
    <tr tabIndex={0}>
      <td>
        <Checkbox checked={false} onChange={() => {}} />
      </td>
      <td>
        <T value={idea.attributes.title_multiloc} />
      </td>
      <td>
        <TagList>
          {input.relationships?.categories.data.map((category) => (
            <Tag
              id={category.id}
              label={category.id}
              key={category.id}
              status="approved"
              onIconClick={() => console.log('clicked')}
            />
          ))}
        </TagList>
      </td>
    </tr>
  );
};

export default InputsTableRow;
