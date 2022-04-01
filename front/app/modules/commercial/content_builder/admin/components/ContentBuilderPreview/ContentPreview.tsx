import React from 'react';

// hooks
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

// components
import Editor from '../Editor';
import ContentBuilderFrame from '../ContentBuilderFrame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

// types
import { Multiloc } from 'typings';

type ContentPreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const ContentPreview = ({ projectId, projectTitle }: ContentPreviewProps) => {
  const locale = useLocale();
  const localize = useLocalize();

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  const loadingContentBuilderLayout = contentBuilderLayout === undefined;

  if (loadingContentBuilderLayout) {
    return <Spinner />;
  }

  const contentBuilderContent =
    !isNilOrError(contentBuilderLayout) &&
    !isNilOrError(locale) &&
    contentBuilderLayout.data.attributes.enabled &&
    contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale];

  return (
    <Box>
      {contentBuilderContent ? (
        <>
          <Title color="text" variant="h1">
            {localize(projectTitle)}
          </Title>
          <Editor isPreview={true}>
            <ContentBuilderFrame projectId={projectId} />
          </Editor>
        </>
      ) : (
        <ProjectInfo projectId={projectId} />
      )}
    </Box>
  );
};

export default ContentPreview;
