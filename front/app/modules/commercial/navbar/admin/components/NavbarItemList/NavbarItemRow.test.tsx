import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import NavbarItemRow from './NavbarItemRow';
import { INavbarItem } from 'services/navbar';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const testNavbarItem: INavbarItem = {
  id: '_1',
  type: 'navbar_item',
  attributes: {
    title_multiloc: { en: 'English title 1' },
    ordering: 0,
    visible: true,
    type: 'custom',
  },
  relationships: { page: { data: { id: '_1', type: 'page' } } },
};

describe('<NavbarItemRow />', () => {
  it('renders', () => {
    render(<NavbarItemRow navbarItem={testNavbarItem} />);

    expect(screen.getByTestId('navbar-item-row')).toBeInTheDocument();
    expect(screen.getByText('English title 1')).toBeInTheDocument();
  });

  it('renders "DEFAULT" tag if needed', () => {
    render(<NavbarItemRow navbarItem={testNavbarItem} isDefaultPage />);
    expect(screen.getByTestId('default-tag')).toBeInTheDocument();
  });

  it('renders add button if needed', () => {
    render(<NavbarItemRow navbarItem={testNavbarItem} showAddButton />);
    expect(screen.getByText('Add to navbar')).toBeInTheDocument();
  });

  it('calls onClickAddButton when add button is clicked', () => {
    const onClickAddButton = jest.fn();

    render(
      <NavbarItemRow
        navbarItem={testNavbarItem}
        showAddButton
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).toHaveBeenLastCalledWith('_1');
  });

  it('disables add button when addButtonDisabled', () => {
    const onClickAddButton = jest.fn();

    render(
      <NavbarItemRow
        navbarItem={testNavbarItem}
        showAddButton
        addButtonDisabled
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).not.toHaveBeenCalled();
  });

  it('renders hide button if showHideButton', () => {
    render(<NavbarItemRow navbarItem={testNavbarItem} showHideButton />);
    expect(screen.getByText('Hide page')).toBeInTheDocument();
  });

  it('calls onClickHideButton when add button is clicked', () => {
    const onClickHideButton = jest.fn();

    render(
      <NavbarItemRow
        navbarItem={testNavbarItem}
        showHideButton
        onClickHideButton={onClickHideButton}
      />
    );

    const hideButton = screen.getByText('Hide page');
    fireEvent.click(hideButton);

    expect(onClickHideButton).toHaveBeenLastCalledWith('_1');
  });
});
