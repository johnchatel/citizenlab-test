import React from 'react';

// components
import CustomPageHeader from './CustomPageHeader';
import TopInfoSection from './TopInfoSection';
import { Container, Content } from 'containers/LandingPage';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import usePage from 'hooks/usePage';
import { useParams } from 'react-router-dom';
import useResourceFiles from 'hooks/useResourceFiles';

// utils
import { isNilOrError } from 'utils/helperUtils';

import { ICustomPageAttributes } from 'services/customPages';

const LandingPage = () => {
  const { slug } = useParams() as {
    slug: string;
  };

  const customPage = usePage({ pageSlug: slug });

  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(customPage) ? customPage.id : null,
  });

  if (isNilOrError(customPage)) {
    return null;
  }

  const attributes = customPage.attributes as unknown as ICustomPageAttributes;
  return (
    <>
      <Container id="e2e-landing-page">
        <CustomPageHeader
          headerLayout={attributes.banner_layout}
          header_bg={attributes.header_bg}
          headerMultiloc={attributes.banner_header_multiloc}
          subheaderMultiloc={attributes.banner_subheader_multiloc}
          headerColor={attributes.banner_overlay_color}
          headerOpacity={attributes.banner_overlay_opacity}
        />
        <Content>
          {attributes.top_info_section_enabled && (
            <TopInfoSection
              multilocContent={attributes.top_info_section_multiloc}
            />
          )}
          {attributes.files_section_enabled &&
            !isNilOrError(remotePageFiles) && (
              <FileAttachments files={remotePageFiles} />
            )}
        </Content>
      </Container>
    </>
  );
};

export default LandingPage;
