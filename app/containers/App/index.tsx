import React, { PureComponent, Suspense, lazy } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isString, isObject, uniq } from 'lodash-es';
import { isNilOrError, isPage } from 'utils/helperUtils';
import moment from 'moment';
import 'moment-timezone';
import { configureScope } from '@sentry/browser';
import GlobalStyle from 'global-styles';

// constants
import { appLocalesMomentPairs, ADMIN_TEMPLATES_GRAPHQL_PATH } from 'containers/App/constants';

// graphql
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

// context
import { PreviousPathnameContext } from 'context';

// libraries
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// analytics
import ConsentManager from 'components/ConsentManager';
import { trackPage } from 'utils/analytics';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import Footer from 'containers/Footer';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import LoadableUserDeleted from 'components/UserDeletedModalContent/LoadableUserDeleted';

// auth
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { authUserStream, signOut, signOutAndDeleteAccountPart2 } from 'services/auth';
import { currentTenantStream, ITenant, ITenantStyle } from 'services/tenant';

// utils
import eventEmitter from 'utils/eventEmitter';
import { getJwt } from 'utils/auth/jwt';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import ErrorBoundary from 'components/ErrorBoundary';

const Container = styled.div`
  background: #fff;
  position: relative;
`;

const InnerContainer = styled.div`
  padding-top: ${props => props.theme.menuHeight}px;
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    padding-top: 0px;
`}
`;

export interface IOpenPostPageModalEvent {
  id: string;
  slug: string;
  type: 'idea' | 'initiative';
}

type Props = {};

type State = {
  previousPathname: string | null;
  tenant: ITenant | null;
  authUser: IUser | null;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  visible: boolean;
  userDeletedModalOpened: boolean;
  userActuallyDeleted: boolean;
};

const PostPageFullscreenModal = lazy(() => import('./PostPageFullscreenModal'));

class App extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[];
  unlisten: Function;

  constructor(props) {
    super(props);
    this.state = {
      previousPathname: null,
      tenant: null,
      authUser: null,
      modalId: null,
      modalSlug: null,
      modalType: null,
      visible: true,
      userDeletedModalOpened: false,
      userActuallyDeleted: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const tenant$ = currentTenantStream().observable;

    this.unlisten = clHistory.listenBefore((newLocation) => {
      const { authUser } = this.state;
      const previousPathname = location.pathname;
      const nextPathname = newLocation.pathname;
      const registrationCompletedAt = (authUser ? authUser.data.attributes.registration_completed_at : null);

      this.setState((state) => ({
        previousPathname: !(previousPathname.endsWith('/sign-up') || previousPathname.endsWith('/sign-in')) ? previousPathname : state.previousPathname
      }));

      trackPage(newLocation.pathname);

      // If already created a user (step 1 of sign-up) and there's a required field in step 2,
      // redirect to complete-signup page
      if (isObject(authUser) && !isString(registrationCompletedAt) && !nextPathname.replace(/\/$/, '').endsWith('complete-signup')) {
        clHistory.replace({
          pathname: '/complete-signup',
          search: newLocation.search
        });
      }
    });

    this.subscriptions = [
      combineLatest(
        authUser$.pipe(tap((authUser) => {
          if (isNilOrError(authUser)) {
            signOut();
          } else {
            configureScope((scope) => {
              scope.setUser({
                id: authUser.data.id,
              });
            });
          }
        })),
        locale$,
        tenant$.pipe(tap((tenant) => {
          moment.tz.setDefault(tenant.data.attributes.settings.core.timezone);

          uniq(tenant.data.attributes.settings.core.locales
            .filter(locale => locale !== 'en' && locale !== 'ach')
            .map(locale => appLocalesMomentPairs[locale]))
            .forEach(locale => require(`moment/locale/${locale}.js`));
        }))
      ).subscribe(([authUser, locale, tenant]) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        this.setState({ tenant, authUser });
      }),

      tenant$.pipe(first()).subscribe((tenant) => {
        if (tenant.data.attributes.style && tenant.data.attributes.style.customFontAdobeId) {
          import('webfontloader').then((WebfontLoader) => {
            WebfontLoader.load({
              typekit: {
                id: (tenant.data.attributes.style as ITenantStyle).customFontAdobeId
              }
            });
          });
        }
      }),

      eventEmitter.observeEvent<IOpenPostPageModalEvent>('cardClick').subscribe(({ eventValue }) => {
        const { id, slug, type } = eventValue;
        this.openPostPageModal(id, slug, type);
      }),

      eventEmitter.observeEvent('closeIdeaModal').subscribe(() => {
        this.closePostPageModal();
      }),

      eventEmitter.observeEvent('tryAndDeleteProfile').subscribe(() => {
        signOutAndDeleteAccountPart2().then(success => {
          if (success) {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: true });
          } else {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: false });
          }
        });
      })
    ];
  }

  componentWillUnmount() {
    this.unlisten();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openPostPageModal = (id: string, slug: string, type: 'idea' | 'initiative') => {
    this.setState({
      modalId: id,
      modalSlug: slug,
      modalType: type
    });
  }

  closePostPageModal = () => {
    this.setState({
      modalId: null,
      modalSlug: null,
      modalType: null
    });
  }

  closeUserDeletedModal = () => {
    this.setState({ userDeletedModalOpened: false });
  }

  render() {
    const { location, children } = this.props;
    const {
      previousPathname,
      tenant,
      modalId,
      modalSlug,
      modalType,
      visible,
      userDeletedModalOpened,
      userActuallyDeleted
    } = this.state;
    const adminPage = isPage('admin', location.pathname);
    const initiativeFormPage = isPage('initiative_form', location.pathname);
    const ideaFormPage = isPage('idea_form', location.pathname);
    const showFooter = !adminPage && !ideaFormPage && !initiativeFormPage;
    const theme = getTheme(tenant);

    return (
      <>
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider theme={theme}>
              <>
                <GlobalStyle />

                <Container>
                  <Meta />

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <PostPageFullscreenModal
                        type={modalType}
                        id={modalId}
                        slug={modalSlug}
                        close={this.closePostPageModal}
                      />
                    </Suspense>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <LoadableModal
                      opened={userDeletedModalOpened}
                      close={this.closeUserDeletedModal}
                    >
                      <LoadableUserDeleted userActuallyDeleted={userActuallyDeleted} />
                    </LoadableModal>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <div id="modal-portal" />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <ConsentManager />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>

                  <InnerContainer >
                    <HasPermission item={{ type: 'route', path: location.pathname }} action="access">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                      <HasPermission.No>
                        <ForbiddenRoute />
                      </HasPermission.No>
                    </HasPermission>
                  </InnerContainer>
                  {showFooter && <Footer />}
                </Container>
              </>
            </ThemeProvider>
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}

const AppWithHoC = withRouter(App);

const cache = new InMemoryCache();

const httpLink = new HttpLink({ uri: ADMIN_TEMPLATES_GRAPHQL_PATH });

const authLink = new ApolloLink((operation, forward) => {
  const jwt = getJwt();

  operation.setContext({
    headers: {
      authorization: jwt ? `Bearer ${jwt}` : ''
    }
  });

  return forward(operation);
});

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink)
});

export default (props: Props) => (
  <ApolloProvider client={client}>
    <AppWithHoC {...props} />
  </ApolloProvider>
);
