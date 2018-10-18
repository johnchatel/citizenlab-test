import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';

// services
import { IProjectData, projectByIdStream, IProject } from 'services/projects';
import { IPhase, IPhaseData, phaseStream } from 'services/phases';
import { postingButtonState } from 'services/ideaPostingRules';

// components
import Button, { ButtonStyles } from 'components/UI/Button';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  projectId?: string | undefined;
  phaseId?: string | undefined;
  style?: ButtonStyles;
  size?: '1' | '2' | '3' | '4';
  fullWidth?: boolean;
  padding?: string;
};

type State = {
  project?: IProjectData | undefined;
  phase?: IPhaseData | undefined;
};

class IdeaButton extends PureComponent<Props & InjectedIntlProps, State> {
  projectId$: BehaviorSubject<string | undefined>;
  phaseId$: BehaviorSubject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: undefined,
      phase: undefined
    };
    this.projectId$ = new BehaviorSubject(undefined);
    this.phaseId$ = new BehaviorSubject(undefined);
    this.subscriptions = [];
  }

  componentDidMount() {
    const projectId$ = this.projectId$.pipe(distinctUntilChanged());
    const phaseId$ = this.phaseId$.pipe(distinctUntilChanged());

    this.projectId$.next(this.props.projectId);
    this.phaseId$.next(this.props.phaseId);

    this.subscriptions = [
      combineLatest(
        projectId$,
        phaseId$
      ).pipe(
        switchMap(([projectId, phaseId]) => {
          const phase$: Observable<IPhase | undefined> = (phaseId ? phaseStream(phaseId).observable : of(undefined));

          return phase$.pipe(
            map((phase) => ({
              phase,
              projectId: (phase ? phase.data.relationships.project.data.id : projectId)
            })),
            switchMap(({ projectId, phase }) => {
              const project$: Observable<IProject | undefined> = (projectId ? projectByIdStream(projectId).observable : of(undefined));

              return project$.pipe(
                map(project => ({ project, phase }))
              );
            })
          );
        })
      ).subscribe(({ project, phase }) => {
        this.setState({
          project: (project ? project.data : undefined),
          phase: (phase ? phase.data : undefined)
        });
      })
    ];
  }

  componentDidUpdate() {
    this.projectId$.next(this.props.projectId);
    this.phaseId$.next(this.props.phaseId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project, phase } = this.state;
    const { show, enabled } = postingButtonState({ project, phase });

    if (show) {
      let { style, size, fullWidth } = this.props;
      const { padding } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);

      style = (style || 'primary');
      size = (size || '1');
      fullWidth = (fullWidth || false);

      return (
        <Button
          className={this.props['className']}
          linkTo={(project ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new')}
          style={style}
          size={size}
          padding={padding}
          text={startAnIdeaText}
          disabled={!enabled}
          fullWidth={fullWidth}
        />
      );
    }

    return null;
  }
}

export default injectIntl<Props>(IdeaButton);
