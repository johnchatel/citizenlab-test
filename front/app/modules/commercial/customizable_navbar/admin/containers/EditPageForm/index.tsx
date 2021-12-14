import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik, FormikProps } from 'formik';

// components
import PageForm, { validatePageForm, FormValues } from 'components/PageForm';
import PageWrapper from 'components/admin/PageWrapper';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import getInitialValues from './getInitialValues';

// services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

const EditPageForm = ({ params: { pageId } }: WithRouterProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  if (isNilOrError(page) || isNilOrError(appConfigurationLocales)) {
    return null;
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }
  ) => {
    const localPageFiles = values.local_page_files;
    const pageId = page.id;

    try {
      await updatePage(pageId, {
        ...getInitialValues(page, remotePageFiles),
        ...values,
      });

      if (!isNilOrError(localPageFiles)) {
        handleAddPageFiles(pageId, localPageFiles, remotePageFiles);
        handleRemovePageFiles(pageId, localPageFiles, remotePageFiles);
      }

      setStatus('success');
      setSubmitting(false);
    } catch (error) {
      setStatus('error');
      setSubmitting(false);
    }
  };

  const goBack = () => {
    clHistory.push('/admin/settings/navigation');
  };

  const renderFn = (pageId: string) => (props: FormikProps<FormValues>) => {
    return <PageForm {...props} pageId={pageId} hideSlugInput={false} />;
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <Title>
        <T value={page.attributes.title_multiloc} />
      </Title>
      <PageWrapper>
        <Formik
          initialValues={getInitialValues(page, remotePageFiles)}
          onSubmit={handleSubmit}
          render={renderFn(page.id)}
          validate={validatePageForm(appConfigurationLocales)}
          validateOnChange={false}
          validateOnBlur={false}
        />
      </PageWrapper>
    </div>
  );
};

export default withRouter(EditPageForm);
