/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ChangeEvent, MouseEvent, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';

import { parseEntityRef } from '@backstage/catalog-model';
import {
  SubvalueCell,
  Table,
  TableColumn,
  useQueryParamState,
} from '@backstage/core-components';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import {
  EntityPeekAheadPopover,
  EntityRefLink,
} from '@backstage/plugin-catalog-react';

import BugReportOutlined from '@mui/icons-material/BugReportOutlined';
import Clear from '@mui/icons-material/Clear';
import Search from '@mui/icons-material/Search';
import TextsmsOutlined from '@mui/icons-material/TextsmsOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { styled, Theme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { feedbackApiRef } from '../../api';
import { FeedbackType } from '../../models/feedback.model';

const PREFIX = 'FeedbackTable';

const classes = {
  textField: `${PREFIX}-textField`,
};

const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  [`& .${classes.textField}`]: {
    padding: 0,
    margin: theme.spacing(2),
    width: '70%',
    [theme.breakpoints.up('lg')]: {
      width: '30%',
    },
  },
}));

export const FeedbackTable = (props: { projectId?: string }) => {
  const projectId = props.projectId ? props.projectId : 'all';
  const api = useApi(feedbackApiRef);
  const analytics = useAnalytics();
  const [feedbackData, setFeedbackData] = useState<FeedbackType[]>([]);
  const [tableConfig, setTableConfig] = useState({
    totalFeedbacks: 100,
    page: 1,
    pageSize: 5,
  });
  const [queryState, setQueryState] = useQueryParamState<string>('id');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState<string>('');

  const columns: TableColumn[] = [
    {
      width: '1%',
      field: 'feedbackType',
      title: 'Type',
      render: (row: any) => {
        const data: FeedbackType = row;
        return data.feedbackType === 'BUG' ? (
          <BugReportOutlined color="error" key={data.feedbackType} />
        ) : (
          <TextsmsOutlined color="primary" key={data.feedbackType} />
        );
      },
    },
    {
      field: 'summary',
      title: 'Summary',
      render: (row: any) => {
        const data: FeedbackType = row;
        const getSummary = () => {
          if (data.summary.length > 100) {
            if (data.summary.split(' ').length > 1)
              return `${data.summary.substring(
                0,
                data.summary.lastIndexOf(' ', 100),
              )}...`;
            return `${data.summary.slice(0, 100)}...`;
          }
          return data.summary;
        };
        return (
          <SubvalueCell
            value={<Typography variant="h6">{getSummary()}</Typography>}
            subvalue={
              <div
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.stopPropagation()}
                tabIndex={0}
                role="tab"
              >
                <EntityPeekAheadPopover entityRef={data.createdBy}>
                  Submitted by&nbsp;
                  <EntityRefLink entityRef={data.createdBy}>
                    {parseEntityRef(data.createdBy).name}
                  </EntityRefLink>
                </EntityPeekAheadPopover>
              </div>
            }
          />
        );
      },
    },
    {
      field: 'projectId',
      title: 'Project',
      render: (row: any) => {
        const data: FeedbackType = row;
        return (
          <EntityRefLink entityRef={data.projectId}>
            {parseEntityRef(data.projectId).name}
          </EntityRefLink>
        );
      },
      align: 'center',
      width: '40%',
    },
    {
      align: 'left',
      field: 'ticketUrl',
      title: 'Ticket',
      disableClick: true,
      width: '10%',
      render: (row: any) => {
        const data: FeedbackType = row;
        return data.ticketUrl ? (
          <Link target="_blank" rel="noopener noreferrer" href={data.ticketUrl}>
            {data.ticketUrl.split('/').pop()}
          </Link>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Tag',
      customSort: (data1: any, data2: any) => {
        const currentRow: FeedbackType = data1;
        const nextRow: FeedbackType = data2;
        return currentRow.tag
          .toLocaleLowerCase('en-US')
          .localeCompare(nextRow.tag.toLocaleLowerCase('en-US'));
      },
      render: (row: any) => {
        const data: FeedbackType = row;
        return (
          <Chip
            label={data.tag}
            variant="outlined"
            color={data.feedbackType === 'FEEDBACK' ? 'primary' : 'error'}
          />
        );
      },
    },
  ];

  useDebounce(
    () => {
      if (searchText.length > 0) analytics.captureEvent('search', searchText);
      api
        .getAllFeedbacks(1, tableConfig.pageSize, projectId, searchText)
        .then(data => {
          setFeedbackData(data.data);
          setTableConfig({
            totalFeedbacks: data.count,
            page: data.currentPage,
            pageSize: data.pageSize,
          });
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    400,
    [projectId, api, tableConfig.pageSize, searchText],
  );

  async function handlePageChange(newPage: number, pageSize: number) {
    analytics.captureEvent(
      'paginate',
      `page: ${newPage + 1}, size: ${pageSize}`,
    );
    if (newPage > tableConfig.page) {
      setTableConfig({
        totalFeedbacks: tableConfig.totalFeedbacks,
        pageSize: pageSize,
        page: newPage - 1,
      });
    }
    setTableConfig({
      totalFeedbacks: tableConfig.totalFeedbacks,
      pageSize: pageSize,
      page: newPage + 1,
    });
    const newData = await api.getAllFeedbacks(
      newPage + 1,
      pageSize,
      projectId,
      searchText,
    );
    return setFeedbackData(newData.data);
  }

  async function handleRowsPerPageChange(pageSize: number) {
    setTableConfig({
      ...tableConfig,
      pageSize: pageSize,
    });
    const newData = await api.getAllFeedbacks(
      tableConfig.page,
      pageSize,
      projectId,
      searchText,
    );
    return setFeedbackData(newData.data);
  }

  function handleRowClick(
    event?: MouseEvent<Element, globalThis.MouseEvent> | undefined,
    rowData?: any,
  ) {
    event?.preventDefault();
    const data: FeedbackType = rowData;
    if (!queryState) setQueryState(data.feedbackId);
  }

  function handleSearch(
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) {
    const _searchText = event.target.value;
    if (_searchText.trim().length !== 0) return setSearchText(_searchText);
    return setSearchText('');
  }

  return (
    <StyledPaper>
      <TextField
        onChange={handleSearch}
        variant="outlined"
        placeholder="Search Feedback"
        value={searchText}
        className={classes.textField}
        InputProps={{
          startAdornment: (
            <Box display="inline-flex" p="12px">
              <Search />
            </Box>
          ),
          endAdornment: (
            <Tooltip title="Clear search" arrow>
              <IconButton onClick={() => setSearchText('')} size="medium">
                <Clear />
              </IconButton>
            </Tooltip>
          ),
        }}
      />
      <TableContainer component={Paper}>
        <Table
          options={{
            paging: feedbackData.length > 0,
            pageSizeOptions: [5, 10, 25],
            pageSize: tableConfig.pageSize,
            paginationPosition: 'bottom',
            padding: 'dense',
            toolbar: false,
            search: false,
            sorting: false,
            emptyRowsWhenPaging: false,
          }}
          isLoading={loading}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          data={feedbackData}
          columns={columns}
          totalCount={tableConfig.totalFeedbacks}
          page={tableConfig.page - 1}
        />
      </TableContainer>
    </StyledPaper>
  );
};
