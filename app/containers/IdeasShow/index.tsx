import React, { PureComponent } from 'react';
import { has, isString, sortBy, last, get, isEmpty, isUndefined } from 'lodash-es';
import { Subscription, combineLatest, of } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import clHistory from 'utils/cl-router/history';

// components
import StatusBadge from 'components/StatusBadge';
import Sharing from 'components/Sharing';
import IdeaMeta from './IdeaMeta';
import IdeaMap from './IdeaMap';
import Modal from 'components/UI/Modal';
import VoteControl from 'components/VoteControl';
import VoteWrapper from './VoteWrapper';
import AssignBudgetWrapper from './AssignBudgetWrapper';
import FileAttachments from 'components/UI/FileAttachments';
import IdeaSharingModalContent from './IdeaSharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import SimilarIdeas from './SimilarIdeas';
import IdeaHeader from './IdeaHeader';
import IdeaAuthor from './IdeaAuthor';
import IdeaFooter from './IdeaFooter';
import Spinner, { ExtraProps as SpinnerProps } from 'components/UI/Spinner';
import OfficialFeedback from './OfficialFeedback';
import Icon from 'components/UI/Icon';
import IdeaBody from './IdeaBody';
import IdeaContentFooter from './IdeaContentFooter';
import ActionBar from './ActionBar';
import TranslateButton from './TranslateButton';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// services
import { updateIdea } from 'services/ideas';
import { authUserStream } from 'services/auth';
import { ITopicData } from 'services/topics';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, ideaPageContentMaxWidth } from 'utils/styleUtils';
import { darken, transparentize } from 'polished';

const loadingSpinnerFadeInDuration = 300;
const loadingSpinnerFadeInEasing = 'ease-out';
const loadingSpinnerFadeInDelay = 100;
const contentFadeInDuration = 400;
const contentFadeInEasing = 'cubic-bezier(0.000, 0.700, 0.000, 1.000)';
const contentFadeInDelay = 350;
const contentTranslateDistance = '25px';

const StyledSpinner = styled<SpinnerProps>(Spinner)`
  transition: all ${loadingSpinnerFadeInDuration}ms ${loadingSpinnerFadeInEasing} ${loadingSpinnerFadeInDelay}ms;
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: opacity;

  &.loading-enter {
    ${StyledSpinner} {
      opacity: 0;
    }

    &.loading-enter-active {
      ${StyledSpinner} {
        opacity: 1;
      }
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  background: #fff;
  transform: none;
  will-change: transform, opacity;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}

  &.inModal {
    min-height: 100vh;

    ${media.smallerThanMaxTablet`
      min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
    `}
  }

  &.content-enter {
    opacity: 0;
    /* transform: translateY(${contentTranslateDistance}); */

    &.content-enter-active {
      opacity: 1;
      /* transform: translateY(0); */
      transition: all ${contentFadeInDuration}ms ${contentFadeInEasing} ${contentFadeInDelay}ms;
    }
  }

  &.content-exit {
    display: none;
  }
`;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: ${ideaPageContentMaxWidth};
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 80px;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 30px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Topics = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-right: 485px;
  margin-bottom: 25px;

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
  `}
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.colorSecondary};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  padding: 6px 14px;
  margin-right: 10px;
  background: ${({ theme }) => transparentize(0.92, theme.colorSecondary)};
  border-radius: 3;
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: 100px;

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const StyledTranslateButton = styled(TranslateButton)`
  display: none;
  width: fit-content;
  margin-bottom: 40px;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const IdeaImage = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 25px;
  border-radius: 3px;
  border: 1px solid ${colors.separation};
`;

const StyledIdeaAuthor = styled(IdeaAuthor)`
  margin-left: -4px;
  margin-bottom: 50px;
`;

const LocationLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 6px;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const LocationIconWrapper = styled.div`
  width: 22px;
  height: 36px;
  margin: 0;
  margin-right: 20px;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LocationIcon = styled(Icon)`
  width: 18px;
  fill: ${colors.label};
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 5px 20px;

  &:hover {
    ${LocationLabel} {
      color: ${darken(0.2, colors.label)};
    }

    ${LocationIcon} {
      fill: ${darken(0.2, colors.label)};
    }
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
`;

const MapContainer = styled.div`
  border: 1px solid ${colors.separation};
  border-radius: 3px;
  margin-bottom: 40px;
`;

const ArrowIcon = styled(Icon)`
  width: 12px;
  height: 7px;
  transform: rotate(90deg);
  transition: all .2s linear;

  &.open {
    transform: rotate(0deg);
  }
`;

const MapWrapper = styled.div`
  border: 1px solid ${colors.separation};
  height: 265px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  margin: 20px 20px 0;

  &.map-enter {
    height: 0;
    opacity: 0;

    &.map-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 250ms ease-out;
    }
  }

  &.map-exit {
    height: 265px;
    opacity: 1;

    &.map-exit-active {
      height: 0;
      opacity: 0;
      transition: all 250ms ease-out;
    }
  }
`;

const MapPaddingBottom = styled.div`
  width: 100%;
  height: 20px;
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 385px;
  width: 385px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ControlWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
  padding: 35px;
  border: 1px solid #E0E0E0;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
`;

const ControlWrapperHorizontalRule: any = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${colors.separation};
  margin: 35px 0;
`;

const VoteLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-bottom: 12px;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const StatusContainer = styled.div``;

const StatusTitle = styled.h4`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
`;

const VoteControlMobile = styled.div`
  border-top: solid 1px ${colors.separation};
  border-bottom: solid 1px ${colors.separation};
  padding-top: 15px;
  padding-bottom: 15px;
  margin-bottom: 30px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const AssignBudgetControlMobile = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 55px;
`;

const SharingMobile = styled(Sharing)`
  padding: 0;
  margin: 0;
  margin-top: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface DataProps {
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaFiles: GetResourceFilesChildProps;
  authUser: GetAuthUserChildProps;
  topics: GetTopicsChildProps;
}

interface InputProps {
  ideaId: string | null;
  inModal?: boolean | undefined;
  animatePageEnter?: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

interface IActionInfos {
  participationContextType: 'Project' | 'Phase' | null;
  participationContextId: string | null;
  budgetingDescriptor: any | null;
  showBudgetControl: boolean | null;
  showVoteControl: boolean | null;
}

interface State {
  opened: boolean;
  loaded: boolean;
  showMap: boolean;
  spamModalVisible: boolean;
  ideaIdForSocialSharing: string | null;
  translateButtonClicked: boolean;
  actionInfos: IActionInfos | null;
}

export class IdeasShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  initialState: State;
  subscriptions: Subscription[];

  static defaultProps = {
    animatePageEnter: true
  };

  constructor(props) {
    super(props);
    const initialState = {
      opened: false,
      loaded: false,
      showMap: false,
      spamModalVisible: false,
      ideaIdForSocialSharing: null,
      translateButtonClicked: false,
      ideaBody: null,
      actionInfos: null
    };
    this.initialState = initialState;
    this.state = initialState;
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const query = clHistory.getCurrentLocation().query;
    const urlHasNewIdeaQueryParam = has(query, 'new_idea_id');
    const newIdea$ = urlHasNewIdeaQueryParam ? of({
      id: get(query, 'new_idea_id'),
      publish: get(query, 'publish')
    }) : of(null);

    this.subscriptions = [
      combineLatest(
        authUser$,
        newIdea$
      ).subscribe(async ([authUser, newIdea]) => {
        if (newIdea && isString(newIdea.id) && !isEmpty(newIdea.id)) {
          if (authUser) {
            setTimeout(() => {
              this.setState({ ideaIdForSocialSharing: newIdea.id });
            }, 2000);

            if (newIdea.publish === 'true') {
              await updateIdea(newIdea.id, { author_id: authUser.data.id, publication_status: 'published' });
              streams.fetchAllWith({ dataId: [newIdea.id], apiEndpoint: [`${API_PATH}/ideas`] });
            }
          }

          window.history.replaceState(null, '', window.location.pathname);
        }
      })
    ];
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { opened, loaded, actionInfos } = prevState;
    const { idea, ideaImages, project, phases } = nextProps;
    let stateToUpdate: Partial<State> = {};

    if (!opened && !isNilOrError(idea)) {
      stateToUpdate = {
        ...stateToUpdate,
        opened: true
      };
    }

    if (!loaded && !isNilOrError(idea) && !isUndefined(ideaImages) && !isNilOrError(project)) {
      stateToUpdate = {
        ...stateToUpdate,
        loaded: true
      };
    }

    if (!actionInfos && !isNilOrError(idea) && !isNilOrError(project) && !isUndefined(phases)) {
      const upvotesCount = idea.attributes.upvotes_count;
      const downvotesCount = idea.attributes.downvotes_count;
      const votingEnabled = idea.relationships.action_descriptor.data.voting.enabled;
      const cancellingEnabled = idea.relationships.action_descriptor.data.voting.cancelling_enabled;
      const votingFutureEnabled = idea.relationships.action_descriptor.data.voting.future_enabled;
      const pbProject = (project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'budgeting' ? project : null);
      const pbPhase = (!pbProject && !isNilOrError(phases) ? phases.find(phase => phase.attributes.participation_method === 'budgeting') : null);
      const pbPhaseIsActive = (pbPhase && pastPresentOrFuture([pbPhase.attributes.start_at, pbPhase.attributes.end_at]) === 'present');
      const lastPhase = (!isNilOrError(phases) ? last(sortBy(phases, [phase => phase.attributes.end_at])) : null);
      const lastPhaseHasPassed = (lastPhase ? pastPresentOrFuture([lastPhase.attributes.start_at, lastPhase.attributes.end_at]) === 'past' : false);
      const pbPhaseIsLast = (pbPhase && lastPhase && lastPhase.id === pbPhase.id);
      const showBudgetControl = !!(pbProject || (pbPhase && (pbPhaseIsActive || (lastPhaseHasPassed && pbPhaseIsLast))));
      const showVoteControl = !!(!showBudgetControl && (votingEnabled || cancellingEnabled || votingFutureEnabled || upvotesCount > 0 || downvotesCount > 0));
      const budgetingDescriptor = get(idea, 'relationships.action_descriptor.data.budgeting', null);
      let participationContextType: 'Project' | 'Phase' | null = null;
      let participationContextId: string | null = null;

      if (pbProject) {
        participationContextType = 'Project';
      } else if (pbPhase) {
        participationContextType = 'Phase';
      }

      if (!isNilOrError(pbProject)) {
        participationContextId = pbProject.id;
      } else if (!isNilOrError(pbPhase)) {
        participationContextId = pbPhase.id;
      }

      stateToUpdate = {
        ...stateToUpdate,
        actionInfos: {
          participationContextType,
          participationContextId,
          budgetingDescriptor,
          showBudgetControl,
          showVoteControl
        }
      };
    }

    return isEmpty(stateToUpdate) ? null : stateToUpdate;
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleMapWrapperSetRef = (element: HTMLDivElement) => {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  handleMapToggle = () => {
    this.setState(({ showMap }) => ({ showMap: !showMap }));
  }

  unauthenticatedVoteClick = () => {
    clHistory.push('/sign-in');
  }

  closeIdeaSocialSharingModal = () => {
    this.setState({ ideaIdForSocialSharing: null });
  }

  onTranslateIdea = () => {
    this.setState(prevState => {
      // analytics
      if (prevState.translateButtonClicked === true) {
        trackEvent(tracks.clickGoBackToOriginalIdeaCopyButton);
      } else if (prevState.translateButtonClicked === false) {
        trackEvent(tracks.clickTranslateIdeaButton);
      }

      return ({
        translateButtonClicked: !prevState.translateButtonClicked
      });
    });
  }

  render() {
    const {
      inModal,
      animatePageEnter,
      ideaFiles,
      locale,
      idea,
      localize,
      ideaImages,
      authUser,
      topics,
      className
    } = this.props;
    const {
      opened,
      loaded,
      showMap,
      ideaIdForSocialSharing,
      translateButtonClicked,
      actionInfos,
    } = this.state;
    const { formatMessage } = this.props.intl;
    let content: JSX.Element | null = null;

    if (!isNilOrError(idea) && !isNilOrError(locale) && loaded) {
      const authorId: string | null = get(idea, 'relationships.author.data.id', null);
      const ideaCreatedAt = idea.attributes.created_at;
      const titleMultiloc = idea.attributes.title_multiloc;
      const ideaTitle = localize(titleMultiloc);
      // If you're not an admin/mod, statusId can be null
      const statusId: string | null = get(idea, 'relationships.idea_status.data.id', null);
      const ideaImageLarge: string | null = get(ideaImages, '[0].attributes.versions.large', null);
      const ideaLocation = (idea.attributes.location_point_geojson || null);
      const ideaAdress = (idea.attributes.location_description || null);
      const projectId = idea.relationships.project.data.id;
      const ideaUrl = location.href;
      const ideaId = idea.id;
      const ideaBody = localize(idea.attributes.body_multiloc);
      const participationContextType = get(actionInfos, 'participationContextType', null);
      const participationContextId = get(actionInfos, 'participationContextId', null);
      const budgetingDescriptor = get(actionInfos, 'budgetingDescriptor', null);
      const showBudgetControl = get(actionInfos, 'showBudgetControl', null);
      const showVoteControl = get(actionInfos, 'showVoteControl', null);
      const utmParams = !isNilOrError(authUser) ? {
        source: 'share_idea',
        campaign: 'share_content',
        content: authUser.id
      } : {
        source: 'share_idea',
        campaign: 'share_content'
      };
      const showTranslateButton = (
        !isNilOrError(idea) &&
        !isNilOrError(locale) &&
        !idea.attributes.title_multiloc[locale]
      );

      content = (
        <>
          <IdeaMeta ideaId={ideaId} />
          <ActionBar
            ideaId={ideaId}
            translateButtonClicked={translateButtonClicked}
            onTranslateIdea={this.onTranslateIdea}
          />
          <IdeaContainer id="e2e-idea-show">
            {!isNilOrError(topics) && topics.length > 0 &&
              <Topics>
                {topics.map((topic: ITopicData) => <Topic key={topic.id}>{localize(topic.attributes.title_multiloc)}</Topic>)}
              </Topics>
            }

            <Content>
              <LeftColumn>
                {/* <FeatureFlag name="machine_translations"> */}
                  {showTranslateButton &&
                    <StyledTranslateButton
                      translateButtonClicked={translateButtonClicked}
                      onClick={this.onTranslateIdea}
                    />
                  }
                {/* </FeatureFlag> */}
                <IdeaHeader
                  ideaId={ideaId}
                  statusId={statusId}
                  ideaTitle={ideaTitle}
                  locale={locale}
                  translateButtonClicked={translateButtonClicked}
                />

                <StyledIdeaAuthor
                  ideaId={ideaId}
                  authorId={authorId}
                  ideaCreatedAt={ideaCreatedAt}
                  showLabel={true}
                />

                {!inModal && showVoteControl &&
                  <VoteControlMobile>
                    <VoteControl
                      ideaId={ideaId}
                      unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                      size="1"
                    />
                  </VoteControlMobile>
                }

                {ideaImageLarge &&
                  <IdeaImage
                    src={ideaImageLarge}
                    alt={formatMessage(messages.imageAltText, { ideaTitle })}
                    className="e2e-ideaImage"
                  />
                }

                {ideaLocation &&
                  <MapContainer>
                    <LocationButton id="e2e-map-toggle" onClick={this.handleMapToggle}>
                      <Location>
                        <LocationIconWrapper>
                          <LocationIcon name="position" />
                        </LocationIconWrapper>
                        <LocationLabel>
                         {ideaAdress}
                        </LocationLabel>
                      </Location>
                      <ArrowIcon name="dropdown" className={showMap ? 'open' : ''}/>
                    </LocationButton>
                    <CSSTransition
                      classNames="map"
                      in={showMap}
                      timeout={300}
                      mountOnEnter={true}
                      unmountOnExit={true}
                      exit={true}
                    >
                      <MapWrapper innerRef={this.handleMapWrapperSetRef}>
                        <IdeaMap location={ideaLocation} id={ideaId} />
                      </MapWrapper>
                    </CSSTransition>
                    {showMap &&  <MapPaddingBottom />}
                  </MapContainer>
                }

                <IdeaBody
                  ideaId={ideaId}
                  locale={locale}
                  ideaBody={ideaBody}
                  translateButtonClicked={translateButtonClicked}
                />

                {!isNilOrError(ideaFiles) && ideaFiles.length > 0 &&
                  <FileAttachments files={ideaFiles} />
                }

                {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                  <AssignBudgetControlMobile>
                    <AssignBudgetWrapper
                      ideaId={ideaId}
                      projectId={projectId}
                      participationContextId={participationContextId}
                      participationContextType={participationContextType}
                      budgetingDescriptor={budgetingDescriptor}
                    />
                  </AssignBudgetControlMobile>
                }

                <StyledOfficialFeedback
                  ideaId={ideaId}
                />

                <IdeaContentFooter
                  ideaId={ideaId}
                  ideaCreatedAt={ideaCreatedAt}
                  commentsCount={idea.attributes.comments_count}
                />

                <SharingMobile
                  url={ideaUrl}
                  twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                  emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                  emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                  utmParams={utmParams}
                />
              </LeftColumn>

              <RightColumnDesktop>
                <MetaContent>
                  {(showVoteControl || showBudgetControl) &&
                    <ControlWrapper className="e2e-vote-controls-desktop">
                      {showVoteControl &&
                        <>
                          <VoteLabel>
                            <FormattedMessage {...messages.voteOnThisIdea} />
                          </VoteLabel>

                          <VoteWrapper
                            ideaId={ideaId}
                            votingDescriptor={idea.relationships.action_descriptor.data.voting}
                            projectId={projectId}
                          />
                        </>
                      }

                      {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                        <AssignBudgetWrapper
                          ideaId={ideaId}
                          projectId={projectId}
                          participationContextId={participationContextId}
                          participationContextType={participationContextType}
                          budgetingDescriptor={budgetingDescriptor}
                        />
                      }

                      <ControlWrapperHorizontalRule />

                      {statusId &&
                        <StatusContainer>
                          <StatusTitle><FormattedMessage {...messages.currentStatus} /></StatusTitle>
                          <StatusBadge statusId={statusId} />
                        </StatusContainer>
                      }
                    </ControlWrapper>
                  }

                  <SharingWrapper>
                    <Sharing
                      url={ideaUrl}
                      twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                      emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                      emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                      utmParams={utmParams}
                    />
                  </SharingWrapper>
                  <FeatureFlag name="similar_ideas">
                    <SimilarIdeas ideaId={ideaId} />
                  </FeatureFlag>
                </MetaContent>
              </RightColumnDesktop>
            </Content>
          </IdeaContainer>

          {loaded && <IdeaFooter ideaId={ideaId} />}
        </>
      );
    }

    return (
      <>
        <CSSTransition
          classNames="loading"
          in={(opened && !loaded)}
          timeout={loadingSpinnerFadeInDuration}
          mountOnEnter={false}
          unmountOnExit={true}
          exit={false}
        >
          <Loading>
            <StyledSpinner />
          </Loading>
        </CSSTransition>

        <CSSTransition
          classNames="content"
          in={(opened && loaded)}
          timeout={contentFadeInDuration + contentFadeInDelay}
          mountOnEnter={false}
          unmountOnExit={false}
          enter={animatePageEnter}
          exit={true}
        >
          <Container className={`${className} ${inModal ? 'inModal' : ''}`}>
            {content}
          </Container>
        </CSSTransition>

        <FeatureFlag name="ideaflow_social_sharing">
          <Modal
            opened={!!ideaIdForSocialSharing}
            close={this.closeIdeaSocialSharingModal}
            hasSkipButton={true}
            skipText={<FormattedMessage {...messages.skipSharing} />}
            label={formatMessage(messages.modalShareLabel)}
          >
            {ideaIdForSocialSharing &&
              <IdeaSharingModalContent ideaId={ideaIdForSocialSharing} />
            }
          </Modal>
        </FeatureFlag>
      </>
    );
  }
}

const IdeasShowWithHOCs = injectLocalize<Props>(injectIntl<Props & InjectedLocalized>(IdeasShow));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser/>,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
  phases: ({ idea, render }) => <GetPhases projectId={get(idea, 'relationships.project.data.id')}>{render}</GetPhases>,
  topics: ({ idea, render }) => {
    let topicIds: string[] = [];

    if (!isNilOrError(idea) && idea.relationships.topics.data && idea.relationships.topics.data.length > 0) {
      topicIds = idea.relationships.topics.data.map(item => item.id);
    }

    return <GetTopics ids={topicIds}>{render}</GetTopics>;
  }
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
