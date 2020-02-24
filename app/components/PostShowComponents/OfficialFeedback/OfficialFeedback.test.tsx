import React from 'react';
import { shallow } from 'enzyme';
import useLocale from 'hooks/useLocale';
import useTenantLocales from 'hooks/useTenantLocales';
import OfficialFeedback from './';

jest.mock('./OfficialFeedbackForm', () => 'OfficialFeedbackForm');
jest.mock('./OfficialFeedbackFeed', () => 'OfficialFeedbackFeed');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useTenantLocales', () => jest.fn(() => ['en']));

describe('<OfficialFeedback />', () => {
  it('matches the snapshot for none-admins', () => {
    useLocale.mockReturnValue('en');
    useTenantLocales.mockReturnValue(['en']);

    const wrapper = shallow(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={false}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for none-admins', () => {
    useLocale.mockReturnValue('en');
    useTenantLocales.mockReturnValue(['en']);

    const wrapper = shallow(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={false}
      />
    );

    expect(wrapper.find('OfficialFeedbackForm').exists()).toBeFalsy();
    expect(wrapper.find('OfficialFeedbackFeed').exists()).toBeTruthy();
  });

  it('renders correctly for admins', () => {
    useLocale.mockReturnValue('en');
    useTenantLocales.mockReturnValue(['en']);

    const wrapper = shallow(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={true}
      />
    );

    expect(wrapper.find('OfficialFeedbackForm').exists()).toBeTruthy();
    expect(wrapper.find('OfficialFeedbackFeed').exists()).toBeTruthy();
  });
});
