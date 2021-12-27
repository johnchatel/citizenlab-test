import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import MobileNavbar from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('hooks/useNavbarItems');
jest.mock('utils/analytics');

describe('<MobileNavbar />', () => {
  it('renders', () => {
    render(<MobileNavbar />);
    expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
  });

  it('renders three default buttons', () => {
    render(<MobileNavbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('All projects')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
