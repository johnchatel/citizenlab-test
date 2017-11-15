import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import * as bowser from 'bowser';

// router
import { Link, browserHistory } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Footer from 'components/Footer';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { ideaByIdStream, ideasStream, updateIdea, IIdeas } from 'services/ideas';
import { projectsStream, IProjects } from 'services/projects';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

// typings
import { IUser } from 'services/users';
import { setTimeout } from 'timers';

const Container: any = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props: any) => props.hasHeader ? '#f8f8f8' : '#fff'};
  position: relative;
`;

const Header = styled.div`
  width: 100vw;
  height: 480px;
  margin: 0;
  padding: 0;
  position: relative;

  ${media.smallerThanMinTablet`
    height: 300px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground: any = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${(props: any) => props.src});
`;

const HeaderImageOverlay = styled.div`
  background: #000;
  opacity: 0.55;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  margin-top: -10px;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 55px;
  line-height: 60px;
  font-weight: 600;
  text-align: left;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  margin: 0;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: 36px;
    line-height: 40px;
    padding: 0;
  `}
`;

const HeaderSubtitle: any = styled.h2`
  width: 100%;
  max-width: 580px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 22px;
  line-height: 26px;
  font-weight: 100;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  hyphens: auto;
  max-width: 980px;
  text-align: left;
  text-decoration: none;
  padding: 0;
  padding-bottom: 0px;
  margin: 0;
  margin-top: 30px;
  border-bottom: solid 1px transparent;

  ${media.smallerThanMinTablet`
    font-size: 20px;
    line-height: 26px;
    margin-top: 20px;
  `}
`;

const Content = styled.div`
  width: 100%;
  background: #f8f8f8;
  z-index: 1;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const Section = styled.div`
  width: 100%;
  margin-top: 80px;
  padding-bottom: 60px;

  ${media.smallerThanMinTablet`
    margin-top: 60px;
  `}
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 35px;
`;

const SectionIcon = styled(Icon)`
  fill: #333;
  height: 30px;
  margin-right: 10px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 28px;
  line-height: 28px;
  font-weight: 500;
  display: flex;
  align-items: flex-end;
  margin: 0;
  padding: 0;
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const ExploreText = styled.div`
  color: #84939E;
  font-size: 17px;
  font-weight: 300;
  line-height: 17px;
  margin-right: 8px;
  text-decoration: underline;
  transition: all 100ms ease-out;
`;

const ExploreIcon = styled(Icon) `
  height: 19px;
  fill: #84939E;
  margin-top: 1px;
  transition: all 100ms ease-out;
`;

const Explore = styled(Link) `
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  &:hover {
    ${ExploreText} {
      color: #000;
    }

    ${ExploreIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const SectionFooter = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ViewMoreButton = styled(Button) `
  margin-top: 20px;
`;

type Props = {};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  currentTenantHeader: string | null;
  hasIdeas: boolean;
  hasProjects: boolean;
};

export const landingPageIdeasQuery = { sort: 'trending', 'page[number]': 1, 'page[size]': 6 };
export const landingPageProjectsQuery = { sort: 'new', 'page[number]': 1, 'page[size]': 2 };

class LandingPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      currentTenantHeader: null,
      hasIdeas: false,
      hasProjects: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const query = browserHistory.getCurrentLocation().query;
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const ideas$ = ideasStream({ queryParameters: landingPageIdeasQuery }).observable;
    const projects$ = projectsStream({ queryParameters: landingPageProjectsQuery }).observable;
    const ideaToPublish$ = (query && query.idea_to_publish ? ideaByIdStream(query.idea_to_publish).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        ideas$,
        projects$
      ).subscribe(([locale, currentTenant, ideas, projects]) => {
        this.setState({
          locale,
          currentTenant,
          currentTenantHeader: (currentTenant.data.attributes.header_bg ? currentTenant.data.attributes.header_bg.large : null),        
          hasIdeas: (ideas !== null && ideas.data.length > 0),
          hasProjects: (projects !== null && projects.data.length > 0)
        });
      }),

      // if sent back to landingpage after socail login
      Rx.Observable.combineLatest(
        authUser$,
        ideaToPublish$
      ).subscribe(async ([authUser, ideaToPublish]) => {
        if (authUser && ideaToPublish && ideaToPublish.data.attributes.publication_status === 'draft') {
          await updateIdea(ideaToPublish.data.id, { author_id: authUser.data.id, publication_status: 'published' });
          ideasStream({ queryParameters: landingPageIdeasQuery }).fetch();
        }

        // remove idea parameter from url
        window.history.replaceState(null, '', window.location.pathname);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToIdeasPage = () => {
    browserHistory.push('/ideas');
  }

  goToProjectsPage = () => {
    browserHistory.push('/projects');
  }

  goToAddIdeaPage = () => {
    browserHistory.push('/ideas/new');
  }

  render() {
    const { locale, currentTenant, currentTenantHeader, hasIdeas, hasProjects } = this.state;
    const { formatMessage } = this.props.intl;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const headerTitleMultiLoc = currentTenant.data.attributes.settings.core.header_title;
      const headerSloganMultiLoc = currentTenant.data.attributes.settings.core.header_slogan;
      const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const currentTenantLogo = currentTenant.data.attributes.logo.large;
      const currentTenantHeaderTitle = (headerTitleMultiLoc && headerTitleMultiLoc[locale]);
      const currentTenantHeaderSlogan = (headerSloganMultiLoc && headerSloganMultiLoc[locale]);
      const title = (currentTenantHeaderTitle ? currentTenantHeaderTitle : formatMessage(messages.titleCity, { name: currentTenantName }));
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : formatMessage(messages.subtitleCity));
      const hasHeaderImage = (currentTenantHeader !== null);

      return (
        <div>
          <Container id="e2e-landing-page" hasHeader={hasHeaderImage}>
            <Header>
              <HeaderImage>
                <HeaderImageBackground src={currentTenantHeader} />
                <HeaderImageOverlay />
              </HeaderImage>

              <HeaderContent>
                <HeaderTitle hasHeader={hasHeaderImage}>
                  {title}
                </HeaderTitle>
                <HeaderSubtitle hasHeader={hasHeaderImage}>
                  {subtitle}
                </HeaderSubtitle>
              </HeaderContent>
            </Header>

            <Content>
              <StyledContentContainer>
                <Section className="ideas">
                  <SectionHeader>
                    <SectionTitle>
                      {/* <SectionIcon name="idea" className="idea" /> */}
                      <FormattedMessage {...messages.trendingIdeas} />
                    </SectionTitle>
                    {hasIdeas &&
                      <Explore to="/ideas">
                        <ExploreText>
                          <FormattedMessage {...messages.exploreAllIdeas} />
                        </ExploreText>
                        <ExploreIcon name="compass" />
                      </Explore>
                    }
                  </SectionHeader>
                  <SectionContainer>
                    <IdeaCards filter={landingPageIdeasQuery} loadMoreEnabled={false} />
                  </SectionContainer>
                  {hasIdeas &&
                    <SectionFooter>
                      <ViewMoreButton
                        text={formatMessage(messages.exploreAllIdeas)}
                        style="primary"
                        size="3"
                        icon="compass"
                        onClick={this.goToIdeasPage}
                        circularCorners={false}
                      />
                    </SectionFooter>
                  }
                </Section>

                {hasProjects &&
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        {/* <SectionIcon name="project2" className="project" /> */}
                        {/* <FormattedMessage {...messages.projectsFrom} values={{ name: currentTenantName }} /> */}
                        <FormattedMessage {...messages.cityProjects} />
                      </SectionTitle>
                      <Explore to="/projects">
                        <ExploreText>
                          <FormattedMessage {...messages.exploreAllProjects} />
                        </ExploreText>
                        <ExploreIcon name="compass" />
                      </Explore>
                    </SectionHeader>
                    <SectionContainer>
                      <ProjectCards filter={landingPageProjectsQuery} loadMoreEnabled={false} />
                    </SectionContainer>
                    <SectionFooter>
                      <ViewMoreButton
                        text={formatMessage(messages.exploreAllProjects)}
                        style="primary"
                        size="3"
                        icon="compass"
                        onClick={this.goToProjectsPage}
                        circularCorners={false}
                      />
                    </SectionFooter>
                  </Section>
                }
              </StyledContentContainer>

              <Footer />
            </Content>
          </Container>
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(LandingPage);
