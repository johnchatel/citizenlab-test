import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ModuleActive from './ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';
import PagesMenu from './admin/containers';
import NavbarTitleField from './admin/components/NavbarTitleField';

const NewPageFormComponent = lazy(
  () => import('./admin/containers/NewPageForm')
);
const EditNavbarItemComponent = lazy(
  () => import('./admin/containers/EditNavbarItemForm')
);

const NavigationSettings = lazy(
  () => import('./admin/containers/NavigationSettings')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.pages-menu': [
      {
        path: 'pages/new',
        element: <NewPageFormComponent />,
      },
      {
        path: 'navbar-items/edit/:navbarItemId',
        element: <EditNavbarItemComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.customize.AllInput': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.initiatives.settings.EnableSwitch': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.policies.start': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.policies.subTitle': () => (
      <PoliciesSubtitle />
    ),
    'app.containers.Admin.pages-menu.index': () => <PagesMenu />,
    'app.containers.Admin.pages-menu.NavigationSettings': () => (
      <NavigationSettings />
    ),
    'app.containers.Admin.pages-menu.containers.EditPageForm.index.onMount': (
      props
    ) => <ModuleActive {...props} />,
    'app.components.PageForm.index.top': (props) => (
      <NavbarTitleField {...props} />
    ),
  },
};

export default configuration;
