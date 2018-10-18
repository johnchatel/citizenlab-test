import React, { PureComponent, FormEvent } from 'react';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, filter as rxFilter, distinctUntilChanged } from 'rxjs/operators';
import { isEmpty, get, isString } from 'lodash-es';

// router
import clHistory from 'utils/cl-router/history';

// components
import InputMultiloc from 'components/UI/InputMultiloc';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';
import Radio from 'components/UI/Radio';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';
import FileUploader from 'components/UI/FileUploader';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from './participationContext';
import HasPermission from 'components/HasPermission';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { getLocalized } from 'utils/i18n';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import {
  IUpdatedProjectProperties,
  IProject,
  projectByIdStream,
  addProject,
  updateProject,
  deleteProject
} from 'services/projects';
import { projectFilesStream, addProjectFile, deleteProjectFile } from 'services/projectFiles';
import { projectImagesStream, addProjectImage, deleteProjectImage } from 'services/projectImages';
import { areasStream, IAreaData } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import eventEmitter from 'utils/eventEmitter';

// utils
import { convertUrlToUploadFileObservable } from 'utils/imageTools';
import streams from 'utils/streams';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { CLError, IOption, Locale, Multiloc, UploadFile } from 'typings';

const timeout = 350;

const StyledInputMultiloc = styled(InputMultiloc) `
  width: 497px;
`;

const ProjectType = styled.div`
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-transform: capitalize;
`;

const StyledSectionField = styled(SectionField) `
  max-width: 100%;
`;

const StyledImagesDropzone = styled(ImagesDropzone) `
  margin-top: 2px;
  padding-right: 100px;
`;

const ParticipationContextWrapper = styled.div`
  width: 497px;
  position: relative;
  padding: 30px;
  padding-bottom: 15px;
  margin-top: 8px;
  display: inline-block;
  border-radius: 5px;
  border: solid 1px #ddd;
  background: #fff;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 25px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 24px;
    border-color: transparent transparent #ddd transparent;
    border-width: 11px;
  }

  &.participationcontext-enter {
    opacity: 0;

    &.participationcontext-enter-active {
      opacity: 1;
    }
  }

  &.participationcontext-exit {
    opacity: 1;

    &.participationcontext-exit-active {
      opacity: 0;
    }
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

type Props = {
  lang: string,
  params: {
    projectId: string
  }
};

interface State {
  loading: boolean;
  processing: boolean;
  project: IProject | null;
  publicationStatus: 'draft' | 'published' | 'archived';
  projectType: 'continuous' | 'timeline';
   projectAttributesDiff: IUpdatedProjectProperties;
  headerBg: UploadFile[] | null;
  presentationMode: 'map' | 'card';
  projectImages: UploadFile[];
  projectImagesToRemove: UploadFile[];
  projectFiles: UploadFile[];
  projectFilesToRemove: UploadFile[];
  noTitleError: Multiloc | null;
  apiErrors: { [fieldName: string]: CLError[] };
  saved: boolean;
  areas: IAreaData[];
  areaType: 'all' | 'selection';
  locale: Locale;
  currentTenant: ITenant | null;
  areasOptions: IOption[];
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
  processingDelete: boolean;
  deleteError: string | null;
}

class AdminProjectEditGeneral extends PureComponent<Props & InjectedIntlProps, State> {
  projectId$: BehaviorSubject<string | null>;
  processing$: BehaviorSubject<boolean>;
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      processing: false,
      project: null,
      publicationStatus: 'published',
      projectType: 'timeline',
      projectAttributesDiff: {},
      headerBg: null,
      presentationMode: 'card',
      projectImages: [],
      projectImagesToRemove: [],
      projectFiles: [],
      projectFilesToRemove: [],
      noTitleError: null,
      apiErrors: {},
      saved: false,
      areas: [],
      areaType: 'all',
      locale: 'en',
      currentTenant: null,
      areasOptions: [],
      submitState: 'disabled',
      processingDelete: false,
      deleteError: null,
    };
    this.projectId$ = new BehaviorSubject(null);
    this.processing$ = new BehaviorSubject(false);
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;
    const project$ = this.projectId$.pipe(
      distinctUntilChanged(),
      switchMap(projectId => projectId ? projectByIdStream(projectId).observable : of(null))
    );

    this.projectId$.next(this.props.params.projectId);

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$,
        areas$,
        project$
      ).subscribe(([locale, currentTenant, areas, project]) => {
        if (!this.state.processingDelete) {
          this.setState((state) => {
            const publicationStatus = (project ? project.data.attributes.publication_status : state.publicationStatus);
            const projectType = (project ? project.data.attributes.process_type : state.projectType);
            const areaType =  ((project && project.data.relationships.areas.data.length > 0) ? 'selection' : 'all');
            const areasOptions = areas.data.map((area) => ({
              value: area.id,
              label: getLocalized(area.attributes.title_multiloc, locale, currentTenant.data.attributes.settings.core.locales)
            }));

            return {
              locale,
              currentTenant,
              project,
              publicationStatus,
              projectType,
              areaType,
              areasOptions,
              presentationMode: (project && project.data.attributes.presentation_mode || state.presentationMode),
              areas: areas.data,
              projectAttributesDiff: {},
              loading: false,
            };
          });
        }
      }),

      project$.pipe(
        switchMap((project) => {
          if (project) {
            const headerUrl = project.data.attributes.header_bg.large;
            const headerBg$ = (headerUrl ? convertUrlToUploadFileObservable(headerUrl, null, null) : of(null));

            const projectFiles$ = (project ? projectFilesStream(project.data.id).observable.pipe(
              switchMap((projectFiles) => {
                if (projectFiles && projectFiles.data && projectFiles.data.length > 0) {
                  return combineLatest(
                    projectFiles.data.map((projectFile) => {
                      const url = projectFile.attributes.file.url;
                      const filename = projectFile.attributes.name;
                      const id = projectFile.id;
                      return convertUrlToUploadFileObservable(url, id, filename);
                    })
                  );
                }

                return of([]);
              })
            ) : of([]));

            const projectImages$ = (project ? projectImagesStream(project.data.id).observable.pipe(
              switchMap((projectImages) => {
                if (projectImages && projectImages.data && projectImages.data.length > 0) {
                  return combineLatest(projectImages.data.filter((projectImage) => {
                    return !!(projectImage.attributes.versions && projectImage.attributes.versions.large);
                  }).map((projectImage) => {
                    const url = projectImage.attributes.versions.large as string;
                    return convertUrlToUploadFileObservable(url, projectImage.id, null);
                  }));
                }

                return of([]);
              })
            ) : of([]));

            return combineLatest(
              this.processing$,
              headerBg$,
              projectFiles$,
              projectImages$
            ).pipe(
              rxFilter(([processing]) => !processing),
              map(([_processing, headerBg, projectFiles, projectImages]) => ({
                headerBg,
                projectFiles,
                projectImages
              }))
            );
          }

          return of({
            headerBg: null,
            projectFiles: [],
            projectImages: []
          });
        })
      ).subscribe(({ headerBg, projectFiles, projectImages }) => {
        if (!this.state.processingDelete) {
          this.setState({
            projectFiles,
            projectImages,
            headerBg: (headerBg ? [headerBg] : null)
          });
        }
      }),

      this.processing$.subscribe((processing) => {
        this.setState({ processing });
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.params.projectId !== prevProps.params.projectId) {
      this.projectId$.next(this.props.params.projectId);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTitleMultilocOnChange = (titleMultiloc: Multiloc, locale: Locale) => {
    this.setState(({ noTitleError, projectAttributesDiff }) => ({
      submitState: 'enabled',
      noTitleError: {
        ...noTitleError,
        [locale]: null
      },
      projectAttributesDiff: {
        ...projectAttributesDiff,
        title_multiloc: titleMultiloc
      }
    }));
  }

  handleParticipationContextOnChange = (participationContextConfig: IParticipationContextConfig) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        ...participationContextConfig
      }
    }));
  }

  handeProjectTypeOnChange = (projectType: 'continuous' | 'timeline') => {
    this.setState(({ projectAttributesDiff }) => ({
      projectType,
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        process_type: projectType
      }
    }));
  }

  handleHeaderOnAdd = (newHeader: UploadFile) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        header_bg: newHeader.base64
      },
      headerBg: [newHeader]
    }));
  }

  handleHeaderOnRemove = async () => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        header_bg: null
      },
      headerBg: null
    }));
  }

  handleProjectFileOnAdd = (newProjectFile: UploadFile) => {
    this.setState((prevState) => {
      const isDuplicate = prevState.projectFiles.some(file => file.base64 === newProjectFile.base64);
      const projectFiles = (isDuplicate ? prevState.projectFiles : [...prevState.projectFiles, newProjectFile]);
      const submitState = (isDuplicate ? prevState.submitState : 'enabled');

      return {
        projectFiles,
        submitState
      };
    });
  }

  handleProjectFileOnRemove = (projectFileToRemove: UploadFile) => {
    this.setState(({ projectFiles, projectFilesToRemove }) => ({
      submitState: 'enabled',
      projectFiles: projectFiles.filter(file => file.base64 !== projectFileToRemove.base64),
      projectFilesToRemove: [
        ...projectFilesToRemove,
        projectFileToRemove
      ],
    }));
  }

  handleProjectImageOnAdd = (newProjectImage: UploadFile) => {
    this.setState((prevState) => {
      const isDuplicate = prevState.projectImages.some(image => image.base64 === newProjectImage.base64);

      return {
        submitState: (isDuplicate ? prevState.submitState : 'enabled'),
        projectImages: (isDuplicate ? prevState.projectImages : [...prevState.projectImages, newProjectImage])
      };
    });
  }

  handleProjectImageOnRemove = (projectImageToRemove: UploadFile) => {
    this.setState(({ projectImages, projectImagesToRemove }) => ({
      submitState: 'enabled',
      projectImages: projectImages.filter(image => image.base64 !== projectImageToRemove.base64),
      projectImagesToRemove: [
        ...projectImagesToRemove,
        projectImageToRemove
      ]
    }));
  }

  handleAreaTypeChange = (value: 'all' | 'selection') => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      areaType: value,
      projectAttributesDiff: {
        ...projectAttributesDiff,
        area_ids: (value === 'all' ? [] : projectAttributesDiff.area_ids)
      }
    }));
  }

  handleAreaSelectionChange = (values: IOption[]) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        area_ids: values.map((value) => (value.value))
      }
    }));
  }

  onSubmit = (event: FormEvent<any>) => {
    event.preventDefault();

    const { projectType } = this.state;

    // if it's a new project of type continuous
    if (projectType === 'continuous') {
      eventEmitter.emit('AdminProjectEditGeneral', 'getParticipationContext', null);
    } else {
      this.save();
    }
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    console.log(participationContextConfig);
    this.save(participationContextConfig);
  }

  handleStatusChange = (value: 'draft' | 'published' | 'archived') => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      publicationStatus: value,
      projectAttributesDiff: {
        ...projectAttributesDiff,
        publication_status: value
      }
    }));
  }

  validate = () => {
    let hasErrors = false;
    const { formatMessage } = this.props.intl;
    const { currentTenant, projectAttributesDiff, project } = this.state;
    const currentTenantLocales = (currentTenant ? currentTenant.data.attributes.settings.core.locales : null);
    const projectAttrs = { ...(project ? project.data.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
    const noTitleError = {} as Multiloc;

    if (currentTenantLocales) {
      currentTenantLocales.forEach((currentTenantLocale) => {
        const title = get(projectAttrs.title_multiloc, currentTenantLocale);

        if (isEmpty(title)) {
          noTitleError[currentTenantLocale] = formatMessage(messages.noTitleErrorMessage);
          hasErrors = true;
        }
      });
    }

    this.setState({
      noTitleError: (!noTitleError || isEmpty(noTitleError) ? null : noTitleError)
    });

    return !hasErrors;
  }

  save = async (participationContextConfig: IParticipationContextConfig | null = null) => {
    if (this.validate()) {
      const { formatMessage } = this.props.intl;
      const { project, projectImages, projectImagesToRemove, projectFiles, projectFilesToRemove } = this.state;
      const projectAttributesDiff: IUpdatedProjectProperties = {
        ...this.state.projectAttributesDiff,
        ...participationContextConfig
      };

      try {
        this.setState({ saved: false });
        this.processing$.next(true);

        let redirect = false;
        let projectId = (project ? project.data.id : null);

        if (!isEmpty(projectAttributesDiff)) {
          if (project) {
            await updateProject(project.data.id, projectAttributesDiff);
            streams.fetchAllWith({ dataId: [project.data.id] });
          } else {
            const project = await addProject(projectAttributesDiff);
            projectId = project.data.id;
            redirect = true;
          }
        }

        if (isString(projectId)) {
          const imagesToAddPromises = projectImages.filter(file => !file.remote).map(file => addProjectImage(projectId as string, file.base64));
          const imagesToRemovePromises = projectImagesToRemove.filter(file => file.remote === true && isString(file.id)).map(file => deleteProjectImage(projectId as string, file.id as string));
          const filesToAddPromises = projectFiles.filter(file => !file.remote).map(file => addProjectFile(projectId as string, file.base64, file.name));
          const filesToRemovePromises = projectFilesToRemove.filter(file => file.remote === true && isString(file.id)).map(file => deleteProjectFile(projectId as string, file.id as string));

          await Promise.all([
            ...imagesToAddPromises,
            ...imagesToRemovePromises,
            ...filesToAddPromises,
            ...filesToRemovePromises
          ] as Promise<any>[]);
        }

        if (redirect) {
          clHistory.push('/admin/projects');
        } else {
          this.setState({
            saved: true,
            submitState: 'success',
            projectImagesToRemove: [],
            projectFilesToRemove: []
          });
          this.processing$.next(false);
        }
      } catch (errors) {
        const apiErrors = get(errors, 'json.errors', formatMessage(messages.saveErrorMessage));
        const submitState = 'error';
        this.setState({ apiErrors, submitState });
        this.processing$.next(false);
      }
    }
  }

  deleteProject = async (event: FormEvent<any>) => {
    event.preventDefault();

    const { project } = this.state;
    const { formatMessage } = this.props.intl;

    if (project && project.data.attributes.internal_role === 'open_idea_box') {
      return;
    }

    if (project && window.confirm(formatMessage(messages.deleteProjectConfirmation))) {
      try {
        this.setState({ processingDelete: true });
        await deleteProject(project.data.id);
        clHistory.push('/admin/projects');
      } catch {
        this.setState({
          processingDelete: false,
          deleteError: formatMessage(messages.deleteProjectError)
        });
      }
    }
  }

  render() {
    const {
      currentTenant,
      locale,
      publicationStatus,
      projectType,
      noTitleError,
      project,
      headerBg,
      projectImages,
      projectFiles,
      loading,
      processing,
      projectAttributesDiff,
      areasOptions,
      areaType,
      submitState,
      apiErrors,
      processingDelete
    } = this.state;

    if (!loading && currentTenant && locale) {
      const projectAttrs = { ...(project ? project.data.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
      const areaIds = projectAttrs.area_ids || (project && project.data.relationships.areas.data.map((area) => (area.id))) || [];
      const areasValues = areaIds.filter((id) => {
        return areasOptions.some(areaOption => areaOption.value === id);
      }).map((id) => {
        return areasOptions.find(areaOption => areaOption.value === id) as IOption;
      });

      return (
        <form className="e2e-project-general-form" onSubmit={this.onSubmit}>
          <Section>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.statusLabel} />
              </Label>
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="draft"
                name="projectstatus"
                id="projecstatus-draft"
                label={<FormattedMessage {...messages.draftStatus} />}
              />
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="published"
                name="projectstatus"
                id="projecstatus-published"
                label={<FormattedMessage {...messages.publishedStatus} />}
              />
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="archived"
                name="projectstatus"
                id="projecstatus-archived"
                label={<FormattedMessage {...messages.archivedStatus} />}
              />
            </SectionField>

            <SectionField>
              <StyledInputMultiloc
                id="project-title"
                type="text"
                valueMultiloc={projectAttrs.title_multiloc}
                label={<FormattedMessage {...messages.titleLabel} />}
                onChange={this.handleTitleMultilocOnChange}
                errorMultiloc={noTitleError}
              />
              <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} />
            </SectionField>

            <SectionField>
              <Label htmlFor="project-area">
                <FormattedMessage {...messages.projectType} />
              </Label>
              {!project ? (
                <>
                  <Radio
                    onChange={this.handeProjectTypeOnChange}
                    currentValue={projectType}
                    value="timeline"
                    name="projecttype"
                    id="projectype-timeline"
                    label={<FormattedMessage {...messages.timeline} />}
                  />
                  <Radio
                    onChange={this.handeProjectTypeOnChange}
                    currentValue={projectType}
                    value="continuous"
                    name="projecttype"
                    id="projectype-continuous"
                    label={<FormattedMessage {...messages.continuous} />}
                  />
                </>
              ) : (
                  <>
                    <ProjectType>{projectType}</ProjectType>
                  </>
                )}

              {!project &&
                <CSSTransition
                  classNames="participationcontext"
                  in={(projectType === 'continuous')}
                  timeout={timeout}
                  mountOnEnter={true}
                  unmountOnExit={true}
                  enter={true}
                  exit={false}
                >
                  <ParticipationContextWrapper>
                    <ParticipationContext
                      onSubmit={this.handleParcticipationContextOnSubmit}
                      onChange={this.handleParticipationContextOnChange}
                    />
                  </ParticipationContextWrapper>
                </CSSTransition>
              }
            </SectionField>

            {project && projectType === 'continuous' &&
              <ParticipationContext
                projectId={project.data.id}
                onSubmit={this.handleParcticipationContextOnSubmit}
                onChange={this.handleParticipationContextOnChange}
              />
            }

            <SectionField>
              <Label htmlFor="project-area">
                <FormattedMessage {...messages.areasLabel} />
              </Label>
              <Radio
                onChange={this.handleAreaTypeChange}
                currentValue={areaType}
                value="all"
                name="areas"
                id="areas-all"
                label={<FormattedMessage {...messages.areasAllLabel} />}
              />
              <Radio
                onChange={this.handleAreaTypeChange}
                currentValue={areaType}
                value="selection"
                name="areas"
                id="areas-selection"
                label={<FormattedMessage {...messages.areasSelectionLabel} />}
              />

              {areaType === 'selection' &&
                <MultipleSelect
                  options={areasOptions}
                  value={areasValues}
                  onChange={this.handleAreaSelectionChange}
                  placeholder=""
                  disabled={areaType !== 'selection'}
                />
              }
            </SectionField>

            <StyledSectionField>
              <Label>
                <FormattedMessage {...messages.headerImageLabel} />
              </Label>
              <StyledImagesDropzone
                images={headerBg}
                imagePreviewRatio={120 / 480}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImageFileSize={5000000}
                maxNumberOfImages={1}
                maxImagePreviewWidth="500px"
                onAdd={this.handleHeaderOnAdd}
                onRemove={this.handleHeaderOnRemove}
              />
            </StyledSectionField>

            <StyledSectionField>
              <Label>
                <FormattedMessage {...messages.projectImageLabel} />
              </Label>
              <StyledImagesDropzone
                images={projectImages}
                imagePreviewRatio={1}
                maxImagePreviewWidth="160px"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImageFileSize={5000000}
                maxNumberOfImages={5}
                onAdd={this.handleProjectImageOnAdd}
                onRemove={this.handleProjectImageOnRemove}
              />
            </StyledSectionField>

            <SectionField>
              <FileUploader
                onFileAdd={this.handleProjectFileOnAdd}
                onFileRemove={this.handleProjectFileOnRemove}
                files={projectFiles}
                errors={apiErrors}
              />
            </SectionField>

            {project &&
              <HasPermission item={project.data} action="delete">
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.deleteProjectLabel} />
                  </Label>
                  <ButtonWrapper>
                    <Button
                      icon="delete"
                      style="delete"
                      onClick={this.deleteProject}
                      processing={processingDelete}
                      disabled={project.data.attributes.internal_role === 'open_idea_box'}
                    >
                      <FormattedMessage {...messages.deleteProjectButton} />
                    </Button>
                  </ButtonWrapper>
                  <Error text={this.state.deleteError} />
                </SectionField>
              </HasPermission>
            }

            <SubmitWrapper
              loading={processing}
              status={submitState}
              messages={{
                buttonSave: messages.saveProject,
                buttonSuccess: messages.saveSuccess,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Section>
        </form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEditGeneral);
