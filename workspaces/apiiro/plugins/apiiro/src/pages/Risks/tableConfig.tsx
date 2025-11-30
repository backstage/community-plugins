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
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';
import {
  ApplicationsList,
  ChipsList,
  ComponentDisplay,
  DueDateDisplay,
  MainContributors,
  RepositoryDisplay,
  RiskLevel,
  RiskStatus,
  SimpleTooltip,
  SourcesDisplay,
  TagsList,
  TeamsDisplay,
} from '../../components';
import { commonRiskColorMappings } from '../../components/RiskLevel';
import { formatDate } from '../../utils/utils';

export const risksColumns: GridColDef[] = [
  {
    field: 'riskStatus',
    headerName: 'Risk Status',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => row.riskStatus,
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        <RiskStatus status={params.value} iconSize="large" />
      </SimpleTooltip>
    ),
  },
  {
    field: 'riskLevel',
    headerName: 'Risk Level',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => row.riskLevel,
    sortComparator: (v1: string, v2: string) => {
      const riskOrder = { Critical: 3, High: 2, Medium: 1, Low: 0 };
      const order1 = riskOrder[v1 as keyof typeof riskOrder] ?? -1;
      const order2 = riskOrder[v2 as keyof typeof riskOrder] ?? -1;
      return order1 - order2;
    },
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        <RiskLevel
          level={params.value}
          colorMapping={commonRiskColorMappings.standard}
          iconSize="large"
        />
      </SimpleTooltip>
    ),
  },
  {
    field: 'policyName',
    headerName: 'Policy Name',
    flex: 1,
    hideable: false,
    minWidth: 220,
    headerAlign: 'center',
    valueGetter: (_, row) => row.ruleName,
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''}>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'component',
    headerName: 'Component',
    flex: 1,
    minWidth: 200,
    valueGetter: (_, row) => row.component,
    renderCell: (params: any) => (
      <ComponentDisplay
        filePath={params.row.sourceCode?.filePath}
        component={params.value ?? ''}
      />
    ),
  },
  {
    field: 'insights',
    headerName: 'Insights',
    flex: 1,
    headerAlign: 'center',
    minWidth: 300,
    valueGetter: (_, row) =>
      row.insights.map((insight: any) => insight.name).join(', '),
    renderCell: (params: any) => {
      const insights = params.row.insights || [];
      return (
        <ChipsList
          items={insights.map((insight: any) => ({
            id: insight.name,
            label: insight.name,
            tooltip: insight.reason,
          }))}
          maxVisible={1}
          gap={0}
          variant="outlined"
          chipSx={{
            maxWidth: '200px',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
        />
      );
    },
  },
  {
    field: 'applications',
    headerName: 'Applications',
    flex: 1,
    minWidth: 280,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <ApplicationsList applications={params.row.applications || []} />
    ),
  },
  {
    field: 'repository',
    headerName: 'Repository',
    flex: 1,
    minWidth: 280,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <RepositoryDisplay entity={params.row.entity} />
    ),
  },
  {
    field: 'riskCategory',
    headerName: 'Risk Category',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => row.riskCategory,
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'discoveredOn',
    headerName: 'Discovered On',
    flex: 1,
    headerAlign: 'center',
    minWidth: 150,
    valueGetter: (_, row) => row.discoveredOn,
    renderCell: (params: any) => {
      const formattedDate = formatDate(params.value);
      return (
        <SimpleTooltip title={formattedDate} centered>
          {formattedDate}
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'source',
    headerName: 'Source',
    flex: 1,
    minWidth: 170,
    headerAlign: 'center',
    valueGetter: (_, row) =>
      row.source.map((source: any) => source.name).join(', '),
    renderCell: (params: any) => (
      <SourcesDisplay sources={params.row.source || []} />
    ),
  },
  {
    field: 'orgTeams',
    headerName: 'Teams',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) =>
      row.orgTeams.map((orgTeam: any) => orgTeam.name).join(', '),
    renderCell: (params: any) => (
      <TeamsDisplay teams={params.row.orgTeams || []} />
    ),
  },
  {
    field: 'mainContributor',
    headerName: 'Main Contributor',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <MainContributors contributors={params.row.contributors || []} />
    ),
  },
  {
    field: 'applicationTags',
    headerName: 'Application Tags',
    flex: 1,
    minWidth: 270,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <TagsList tags={params.row.applicationTags || []} />
    ),
  },
  {
    field: 'repositoryTags',
    headerName: 'Repository Tags',
    flex: 1,
    minWidth: 270,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <TagsList tags={params.row.repositoryTags || []} />
    ),
  },
  {
    field: 'repositoryGroup',
    headerName: 'Repository Group',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => row.entity?.details?.repositoryGroup,
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    flex: 1,
    minWidth: 150,
    type: 'date',
    headerAlign: 'center',
    valueGetter: (_, row) => (row.dueDate ? new Date(row.dueDate) : null),
    renderCell: (params: any) => {
      return <DueDateDisplay dateString={params.value} />;
    },
  },
  {
    field: 'serverUrl',
    headerName: 'Server URL',
    flex: 1,
    minWidth: 150,
    valueGetter: (_, row) => row.entity?.details?.serverUrl,
    renderCell: (params: any) => {
      return (
        <SimpleTooltip title={params.value ?? ''}>
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            {params.value}
          </Link>
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'findingName',
    headerName: 'Finding Name',
    flex: 1,
    minWidth: 180,
    headerAlign: 'center',
    valueGetter: (_, row) => row.findingName,
    renderCell: (params: any) => {
      return (
        <SimpleTooltip title={params.value ?? ''}>
          {params.value ?? ''}
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'findingCategory',
    headerName: 'Finding Category',
    flex: 1,
    minWidth: 180,
    headerAlign: 'center',
    valueGetter: (_, row) => row.findingCategory,
    renderCell: (params: any) => {
      return (
        <SimpleTooltip title={params.value ?? ''} centered>
          {params.value ?? ''}
        </SimpleTooltip>
      );
    },
  },
];

export const columnVisibilityModal = {
  riskStatus: true,
  riskLevel: true,
  policyName: true,
  component: true,
  insights: true,
  applications: true,
  repository: true,
  riskCategory: true,
  discoveredOn: true,
  source: true,
  orgTeams: true,
  mainContributor: true,
  applicationTags: false,
  repositoryTags: false,
  repositoryGroup: false,
  dueDate: false,
  serverUrl: false,
  findingName: false,
  findingCategory: false,
};
