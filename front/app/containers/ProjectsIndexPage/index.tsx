import React, { useEffect, useState } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import CityLogoSection from 'components/CityLogoSection';
import ProjectsIndexMeta from './ProjectsIndexMeta';
import SearchInput from 'components/UI/SearchInput';

// history
import { useSearchParams } from 'react-router-dom';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const StyledSearchInput = styled(SearchInput)`
  margin-bottom: 40px;
`;

const ProjectsIndex = () => {
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const focusSearch = searchParams.get('focusSearch');
    // it's a string from the query param
    if (focusSearch === 'true') {
      // this should be a ref to the input element
      // it's null on page load
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
      searchParams.delete('focusSearch');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleSearchOnChange = (search: string) => {
    setSearch(search);
  };

  return (
    <>
      <ProjectsIndexMeta />
      <Container>
        <StyledContentContainer mode="page">
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>
          <StyledSearchInput
            onChange={handleSearchOnChange}
            a11y_numberOfSearchResults={1}
          />
          <ProjectAndFolderCards
            showTitle={false}
            layout="threecolumns"
            publicationStatusFilter={['published', 'archived']}
            search={search}
          />
        </StyledContentContainer>
        <CityLogoSection />
      </Container>
    </>
  );
};

export default ProjectsIndex;
