import React from 'react';
import { shallow } from 'enzyme';

import { AssigneeFilter } from './AssigneeFilter';
import { makeUser } from 'services/__mocks__/users';

jest.mock('utils/cl-intl');
jest.mock('resources/GetUsers');
jest.mock('services/users');
jest.mock('services/auth');
import { intl } from 'utils/cl-intl';

describe('<RegistrationFieldsToGraphs />', () => {
  let handleAssigneeFilterChange: jest.Mock;
  beforeEach(() => {
    handleAssigneeFilterChange = jest.fn();
  });

  it('processes options correctly', () => {
    const authUser = makeUser({ roles: [{ type: 'admin' }] }, 'me').data;
    const prospectAssignees = ['admin1', 'admin2', 'admin3'].map(name => makeUser({ slug: name, first_name: name, roles: [{ type: 'admin' }] }, name).data);
    prospectAssignees.push(authUser);

    const wrapper = shallow(
      <AssigneeFilter
        intl={intl}
        authUser={authUser}
        handleAssigneeFilterChange={handleAssigneeFilterChange}
        prospectAssignees={{ usersList: prospectAssignees }}
        assignee="me"
        projectId={undefined}
      />
    );
    expect(wrapper.find('Dropdown').prop('options')).toMatchSnapshot();
  });
});
