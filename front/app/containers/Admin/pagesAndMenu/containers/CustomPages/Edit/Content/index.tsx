import React from 'react';

// components
import PageWrapper from 'components/admin/PageWrapper';
import SectionToggle from 'containers/Admin/pagesAndMenu/SectionToggle';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// services
import { updateCustomPage } from 'services/customPages';

// hooks
import useCustomPage from 'hooks/useCustomPage';

// routing
import { useParams } from 'react-router-dom';

// utils
import clHistory from 'utils/cl-router/history';

// types
const Component = () => {
  const { customPageId } = useParams();
  // to be typed
  const sectionTogglesData = [
    {
      name: 'banner_enabled',
      titleMessageDescriptor: messages.heroBanner,
      tooltipMessageDescriptor: messages.heroBannerTooltip,
      linkToPath: 'homepage-banner',
    },
    {
      name: 'top_info_section_enabled',
      titleMessageDescriptor: messages.topInfoSection,
      tooltipMessageDescriptor: messages.topInfoSectionTooltip,
      linkToPath: 'top-info-section',
    },
    {
      name: 'projects_enabled',
      titleMessageDescriptor: messages.projectsList,
      tooltipMessageDescriptor: messages.projectsListTooltip,
      linkToPath: 'projects',
    },
    {
      name: 'events_enabled',
      titleMessageDescriptor: messages.eventsList,
      tooltipMessageDescriptor: messages.eventsListTooltip,
    },
    {
      name: 'bottom_info_section_enabled',
      titleMessageDescriptor: messages.bottomInfoSection,
      tooltipMessageDescriptor: messages.bottomInfoSectionTooltip,
      linkToPath: 'bottom-info-section',
    },
    {
      name: 'attachments_enabled',
      titleMessageDescriptor: messages.attachmentsSection,
      tooltipMessageDescriptor: messages.attachmentsSectionTooltip,
      linkToPath: 'attachments',
      // until things are typed properly
      hideToggle: false,
    },
  ];

  const handleOnChangeToggle = (sectionName: string) => async () => {
    updateCustomPage(customPageId, {
      [sectionName]: true
    })    
    // console.log(sectionName);
    return sectionName;
  };

  const handleOnClick = (url: string) => {
    if (url) {
      // add in actual page ID to string here
      clHistory.push(`/admin/pages-menu/custom/edit/${url}/`);
    }
  };

  const customPage = useCustomPage(customPageId)
  console.log({ customPage })

  return (
    <PageWrapper>
      <Box display="flex" flexDirection="column">
        <Box mb="28px">
          <Warning>
            <FormattedMessage {...messages.sectionDescription} />
          </Warning>
        </Box>
        {sectionTogglesData.map(
          (
            {
              name,
              titleMessageDescriptor,
              tooltipMessageDescriptor,
              linkToPath,
              hideToggle,
            },
            index
          ) => {
            return (
              <SectionToggle
                key={name}
                name={name}
                checked={true}
                onChangeSectionToggle={handleOnChangeToggle(name)}
                onClickEditButton={handleOnClick}
                editLinkPath={linkToPath}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
                disabled={false}
                isLastItem={index === sectionTogglesData.length - 1}
                hideToggle={hideToggle}
              />
            );
          }
        )}
      </Box>
    </PageWrapper>
  );
};

export default Component;
