import React from 'react';

import useNavbarItems from 'hooks/useNavbarItems';
import { getNavbarItemSlug, INavbarItem } from 'services/navbar';
import NavbarItemRow from '../../NavbarItemRow';
import { List, Row } from 'components/admin/ResourceList';
import { isNilOrError } from 'utils/helperUtils';
import usePageSlugById from 'hooks/usePageSlugById';
import clHistory from 'utils/cl-router/history';
import { PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

export default function VisibleNavbarItemList() {
  const navbarItems = useNavbarItems({ onlyDefault: true });
  const pageSlugById = usePageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    // redirect to homepage toggle page
    if (navbarItem?.attributes?.code && navbarItem.attributes.code === 'home') {
      clHistory.push(`${PAGES_MENU_PATH}/homepage/`);
      return;
    }

    const pageData = navbarItem.relationships.static_page.data;

    pageData
      ? clHistory.push(`${PAGES_MENU_PATH}/custom/${pageData.id}`)
      : clHistory.push(`${PAGES_MENU_PATH}/navbar-items/edit/${navbarItem.id}`);
  };

  const getViewButtonLink = (navbarItem: INavbarItem) => {
    return (
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/'
    );
  };

  return (
    <List>
      {navbarItems.map((navbarItem: INavbarItem, i: number) => (
        <Row key={navbarItem.id} isLastItem={i === navbarItems.length - 1}>
          <NavbarItemRow
            title={navbarItem.attributes.title_multiloc}
            showEditButton
            viewButtonLink={getViewButtonLink(navbarItem)}
            onClickEditButton={handleClickEdit(navbarItem)}
            data-testid="navbar-item-row"
          />
        </Row>
      ))}
    </List>
  );
}
