import React, { useState } from 'react';

// components
import { Table, Body, Footer, Row, HeaderCell } from 'components/admin/Table';
import Pagination from 'components/admin/Pagination';
import Button from 'components/UI/Button';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import SearchInput from 'components/UI/SearchInput';

// resources
import GetInvites, {
  GetInvitesChildProps,
  SortAttribute,
} from 'resources/GetInvites';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

// utils
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import { saveAs } from 'file-saver';

const Container = styled.div`
  th::after {
    margin-top: -7px !important;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;

  .no-padding-right button {
    padding-right: 0;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InvitesTable = ({
  invitesList,
  sortAttribute,
  sortDirection,
  currentPage,
  lastPage,
  onChangeSorting,
  onChangePage,
  onChangeSearchTerm,
}: GetInvitesChildProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [exporting, setExporting] = useState(false);

  if (isNilOrError(invitesList)) return null;

  const handleInvitesExport = async () => {
    try {
      setExporting(true);

      const blob = await requestBlob(
        `${API_PATH}/invites/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      saveAs(blob, 'invites-export.xlsx');

      setExporting(false);
    } catch (error) {
      setExporting(false);
    }
  };

  const handleSortHeaderClick = (sortAttribute: SortAttribute) => () => {
    onChangeSorting(sortAttribute);
  };

  const handleChangeSearchTerm = (searchValue: string) => {
    setSearchValue(searchValue);
    onChangeSearchTerm(searchValue);
  };

  return (
    <Container>
      <HeaderContainer>
        <SearchInput
          onChange={handleChangeSearchTerm}
          a11y_numberOfSearchResults={invitesList.length}
        />
        <Button
          buttonStyle="cl-blue"
          icon="download"
          onClick={handleInvitesExport}
          processing={exporting}
        >
          <FormattedMessage {...messages.exportInvites} />
        </Button>
      </HeaderContainer>

      {invitesList.length > 0 && (
        <Table>
          <TableHeader
            sortAttribute={sortAttribute}
            sortDirection={sortDirection}
            onSortHeaderClick={handleSortHeaderClick}
          />

          <Body horizontalBorders>
            {invitesList.map((invite) => (
              <TableRow key={invite.id} invite={invite} />
            ))}
          </Body>

          {currentPage && lastPage && lastPage > 1 && (
            <Footer>
              <Row>
                <HeaderCell width="100%">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    loadPage={onChangePage}
                  />
                </HeaderCell>
              </Row>
            </Footer>
          )}
        </Table>
      )}

      {isEmpty(invitesList) && !isEmpty(searchValue) && (
        <EmptyStateContainer>
          <FormattedMessage {...messages.currentlyNoInvitesThatMatchSearch} />
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default () => (
  <GetInvites>{(invites) => <InvitesTable {...invites} />}</GetInvites>
);
