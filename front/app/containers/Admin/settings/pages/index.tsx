import React from 'react';
import { FIXED_PAGES_ALLOWED_TO_EDIT } from 'services/pages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PageEditor from '../policies/PageEditor';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledLink = styled(Link)`
  color: ${colors.adminSecondaryTextColor};
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const AdminSettingsPages = () => (
  <>
    <SectionTitle>
      <FormattedMessage {...messages.fixedPagesTitle} />
    </SectionTitle>
    <SectionDescription>
      <FormattedMessage
        {...messages.fixedPagesSubtitle}
        values={{
          policiesLink: (
            <StyledLink to="/admin/settings/policies">
              <FormattedMessage {...messages.fixedPagesSubtitleLink} />
            </StyledLink>
          ),
        }}
      />
    </SectionDescription>
    {FIXED_PAGES_ALLOWED_TO_EDIT.map((slug) => (
      <PageEditor key={slug} pageSlug={slug} />
    ))}
  </>
);

export default AdminSettingsPages;
