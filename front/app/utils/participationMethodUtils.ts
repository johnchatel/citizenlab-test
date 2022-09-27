import { ParticipationMethod } from 'services/participationContexts';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { isNilOrError } from './helperUtils';

type ParticipationMethodConfig = {
  /** We currently have 2 UIs for admins to edit the form definition. This
   * defines which UI, if any, the method uses */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
};

const ideationConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  formEditor: 'surveyEditor',
};

const informationConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const surveyConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const budgetingConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
};

const pollConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const volunteeringConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const methodToConfig: {
  [method in ParticipationMethod]: ParticipationMethodConfig;
} = {
  ideation: ideationConfig,
  native_survey: nativeSurveyConfig,
  information: informationConfig,
  survey: surveyConfig,
  budgeting: budgetingConfig,
  poll: pollConfig,
  volunteering: volunteeringConfig,
};

/** Get the configuration object for the given participation method
 */
export function getMethodConfig(
  participationMethod: ParticipationMethod
): ParticipationMethodConfig {
  return methodToConfig[participationMethod];
}

/** Given the project and its phases, returns an array of all participation methods
 * used in the project
 */
export function getAllParticipationMethods(
  project: IProjectData,
  phases: IPhaseData[] | null
): ParticipationMethod[] {
  const { process_type, participation_method } = project.attributes;
  if (process_type === 'continuous') {
    return [participation_method];
  } else if (process_type === 'timeline' && !phases) {
    return [];
  } else if (process_type === 'timeline' && phases) {
    return phases.map((phase) => phase.attributes.participation_method);
  } else {
    throw `Unknown process_type ${project.attributes.process_type}`;
  }
}

/** Given the project and its phases, returns whether the InputManager should be shown in the back office.
 */
export function showInputManager(
  project: IProjectData,
  phases?: Error | IPhaseData[] | null | undefined
): boolean {
  if (
    project.attributes.process_type === 'continuous' &&
    (project.attributes.participation_method === 'ideation' ||
      project.attributes.participation_method === 'budgeting')
  ) {
    return true;
  } else if (project.attributes.process_type === 'timeline') {
    if (!isNilOrError(phases)) {
      if (
        hasPhaseOfType(phases, 'ideation') ||
        hasPhaseOfType(phases, 'budgeting')
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Given an array of Phases and a participation method, returns whether one of
 * the phases is of the given method.
 */
export function hasPhaseOfType(
  phases: IPhaseData[],
  type: ParticipationMethod
) {
  let found = false;
  phases.map((phase) => {
    if (phase.attributes.participation_method === type && found === false) {
      found = true;
    }
  });
  return found;
}
