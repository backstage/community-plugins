/*
 * Copyright 2025 The Backstage Authors
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

import { FC, useEffect, useState } from 'react';
import {
  Content,
  TableColumn,
  Table,
  MarkdownContent,
  Link,
} from '@backstage/core-components';
import { DateTime } from 'luxon';
import { useApi } from '@backstage/core-plugin-api';
import { Box } from '@material-ui/core';
import { isBitbucketSlugSet } from '../utils/isBitbucketSlugSet';

import { bitbucketApiRef, PullRequest } from '../api/BitbucketApi';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Tooltip from '@material-ui/core/Tooltip';
import StatusFilter from '../components/StatusFilter';
import { useEntity } from '@backstage/plugin-catalog-react';

const GetElapsedTime = ({ start }: { start: string }) =>
  DateTime.fromISO(start).toRelative();

const RenderStateIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'OPEN':
      return (
        <Tooltip title="Open" placement="top">
          <span>
            <HourglassEmptyIcon color="primary" />
          </span>
        </Tooltip>
      );
    case 'MERGED':
      return (
        <Tooltip title="Merged" placement="top">
          <span>
            <CheckCircleIcon color="action" />
          </span>
        </Tooltip>
      );
    case 'DECLINED':
      return (
        <Tooltip title="Declined" placement="top">
          <span>
            <CancelIcon color="error" />
          </span>
        </Tooltip>
      );
    default:
      return null;
  }
};

const PullRequestDetailPanel = ({ rowData }: { rowData: PullRequest }) => (
  <Box marginLeft="14px">
    <MarkdownContent
      content={rowData.description ?? '_No description provided._'}
      dialect="gfm"
    />
  </Box>
);

const PullRequestList: FC = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const { entity } = useEntity();
  const project = isBitbucketSlugSet(entity);
  const bitbucketApi = useApi(bitbucketApiRef);
  const projectName = project.split('/')[0];
  const repoName = project.split('/')[1];

  useEffect(() => {
    setLoading(true);
    bitbucketApi
      .fetchPullRequestList(
        projectName,
        repoName,
        stateFilter !== 'All' ? stateFilter : undefined,
      )
      .then(data => {
        setPullRequests(data);
        setLoading(false);
      })
      .catch(error => error);
  }, [stateFilter, projectName, repoName, bitbucketApi]);

  const columns: TableColumn<PullRequest>[] = [
    {
      title: 'ID',
      field: 'id',
      highlight: true,
      width: '20%',
      render: (row: Partial<PullRequest>) => (
        <Box fontWeight="fontWeightBold">
          <Link to={`${row.url}`}>#{row.id}</Link>
        </Box>
      ),
    },
    {
      title: 'TITLE',
      field: 'title',
      highlight: true,
      width: '30%',
      render: rowData => <Box fontWeight="fontWeightBold">{rowData.title}</Box>,
    },
    {
      title: 'STATE',
      field: 'state',
      highlight: true,
      width: '10%',
      render: rowData => <RenderStateIcon status={rowData.state} />,
    },
    {
      title: 'AUTHOR',
      field: 'author',
      highlight: true,
      width: '20%',
      render: (row: Partial<PullRequest>) => (
        <Box fontWeight="fontWeightBold">{row.author}</Box>
      ),
    },

    {
      title: 'CREATED',
      field: 'created_on',
      highlight: true,
      width: '20%',
      render: (row: Partial<PullRequest>) => (
        <GetElapsedTime start={row.created_on!} />
      ),
    },
    {
      title: 'LAST UPDATED',
      field: 'updated_on',
      highlight: true,
      width: '20%',
      render: rowData => <GetElapsedTime start={rowData.updated_on} />,
    },
  ];

  return (
    <div>
      <Content>
        <Table
          columns={columns}
          data={pullRequests}
          detailPanel={PullRequestDetailPanel}
          isLoading={loading}
          title={
            <Box display="flex" alignItems="center">
              <Box mr={1} />
              Bitbucket Pull Requests ({project})
              <Box position="absolute" right={320} top={20}>
                <StatusFilter onFilterChange={setStateFilter} />
              </Box>
            </Box>
          }
        />
      </Content>
    </div>
  );
};
export default PullRequestList;
