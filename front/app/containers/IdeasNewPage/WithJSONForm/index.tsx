import React, { useContext, useEffect, useState, useCallback } from 'react';
import { PreviousPathnameContext } from 'context';
import { useSearchParams } from 'react-router-dom';

import { WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';

import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';

import { isError, isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useInputSchema from 'hooks/useInputSchema';
import { getInputTerm } from 'services/participationContexts';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import IdeasNewMeta from '../IdeasNewMeta';
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';

import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { addIdea } from 'services/ideas';
import { geocode, reverseGeocode } from 'utils/locationTools';

// renderers
import {
  linearScaleControlTester,
  LinearScaleControl,
  inputControlTester,
  InputControl,
  textAreaControlTester,
  TextAreaControl,
  multiSelectCheckboxControlTester,
  MultiSelectCheckboxControl,
  singleSelectRadioControlTester,
  SingleSelectRadioControl,
  WYSIWYGControlTester,
  WYSIWYGControl,
  descriptionControlTester,
  DescriptionControl,
  topicsControlTester,
  TopicsControl,
  titleControlTester,
  TitleControl,
  imageControlTester,
  ImageControl,
  attachmentsControlTester,
  AttachmentsControl,
  clCategoryTester,
  CLCategoryLayout,
  locationControlTester,
  LocationControl,
  dateControlTester,
  DateControl,
  userPickerControlTester,
  UserPickerControl,
  multilocInputTester,
  MultilocInputLayout,
  orderedLayoutTester,
  OrderedLayout,
} from 'components/Form/Components/Controls';

// for getting inital state from previous page
import { parse } from 'qs';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

const IdeasNewPageWithJSONForm = ({ params }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const project = useProject({ projectSlug: params.slug });
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');

  const phases = usePhases(project?.id);
  const { schema, uiSchema, inputSchemaError } = useInputSchema(
    project?.id,
    phaseId
  );

  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (
      !isPrivilegedUser &&
      (authUser === null ||
        (!isNilOrError(project) &&
          !project.attributes.action_descriptor.posting_idea.enabled))
    ) {
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, project, previousPathName]);

  const search = location.search;
  // Click on map flow :
  // clicked location is passed in url params
  // reverse goecode them and use them as initial data
  const [processingLocation, setProcessingLocation] = useState(Boolean(search));
  const [initialFormData, setInitialFormData] = useState({});

  useEffect(() => {
    const { lat, lng } = parse(search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    if (lat && lng) {
      setInitialFormData((initialFormData) => ({
        ...initialFormData,
        location_point_geojson: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      }));
    }

    if (typeof lat === 'number' && typeof lng === 'number') {
      reverseGeocode(lat, lng).then((address) => {
        setInitialFormData((initialFormData) => ({
          ...initialFormData,
          location_description: address,
        }));
        setProcessingLocation(false);
      });
    }
  }, [search]);

  const onSubmit = async (data) => {
    // TODO Next iteration: Handle the submit differently for ideas versus survey inputs (i.e. no redirection)

    let location_point_geojson;

    if (data.location_description && !data.location_point_geojson) {
      location_point_geojson = await geocode(data.location_description);
    }

    const idea = await addIdea({
      ...data,
      location_point_geojson,
      project_id: project?.id,
      publication_status: 'published',
      phase_ids: phaseId ? [phaseId] : null,
    });
    const ideaId = idea.data.id;

    clHistory.push({
      pathname: `/ideas/${idea.data.attributes.slug}`,
      search: `?new_idea_id=${ideaId}`,
    });
  };

  const getApiErrorMessage: ApiErrorGetter = useCallback(
    (error) => {
      return (
        messages[`api_error_${uiSchema?.options?.inputTerm}_${error}`] ||
        messages[`api_error_${error}`] ||
        messages[`api_error_invalid`]
      );
    },
    [uiSchema]
  );

  const getAjvErrorMessage: AjvErrorGetter = useCallback(
    (error) => {
      return (
        messages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        messages[
          `ajv_error_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        undefined
      );
    },
    [uiSchema]
  );

  const formRenderers = [
    { tester: linearScaleControlTester, renderer: LinearScaleControl },
    { tester: inputControlTester, renderer: InputControl },
    { tester: textAreaControlTester, renderer: TextAreaControl },
    {
      tester: multiSelectCheckboxControlTester,
      renderer: MultiSelectCheckboxControl,
    },
    {
      tester: singleSelectRadioControlTester,
      renderer: SingleSelectRadioControl,
    },
    { tester: WYSIWYGControlTester, renderer: WYSIWYGControl },
    { tester: descriptionControlTester, renderer: DescriptionControl },
    { tester: topicsControlTester, renderer: TopicsControl },
    { tester: titleControlTester, renderer: TitleControl },
    { tester: imageControlTester, renderer: ImageControl },
    { tester: attachmentsControlTester, renderer: AttachmentsControl },
    { tester: clCategoryTester, renderer: CLCategoryLayout },
    { tester: orderedLayoutTester, renderer: OrderedLayout },
    { tester: locationControlTester, renderer: LocationControl },
    { tester: dateControlTester, renderer: DateControl },
    { tester: userPickerControlTester, renderer: UserPickerControl },
    { tester: multilocInputTester, renderer: MultilocInputLayout },
    { tester: orderedLayoutTester, renderer: OrderedLayout },
  ];

  return (
    <PageContainer id="e2e-idea-new-page" overflow="hidden">
      {!isNilOrError(project) && !processingLocation && schema && uiSchema ? (
        <>
          <IdeasNewMeta />
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            initialFormData={initialFormData}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            inputId={undefined}
            providedRenderers={formRenderers}
            title={
              <FormattedMessage
                {...{
                  idea: messages.ideaFormTitle,
                  option: messages.optionFormTitle,
                  project: messages.projectFormTitle,
                  question: messages.questionFormTitle,
                  issue: messages.issueFormTitle,
                  contribution: messages.contributionFormTitle,
                }[
                  getInputTerm(
                    project?.attributes.process_type,
                    project,
                    phases
                  )
                ]}
              />
            }
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
