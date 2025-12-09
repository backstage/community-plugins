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
import { GridColDef } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { Chip, ChipsList, RiskLevel, SimpleTooltip } from '../../components';
import { scmProviderIcons } from '../../components/common/scmProviders';
import { formatDate } from '../../utils/utils';
import Typography from '@mui/material/Typography';

// Color mapping for business impact
export const businessImpactColorMapping = {
  High: 'error',
  Medium: 'warning',
  Low: 'warning',
} as const;

// Repository columns configuration
export const repositoryColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Repository Name',
    flex: 1.5,
    hideable: false,
    minWidth: 230,
    valueGetter: (_, row) => `${row.name} (${row.branchName})`,
    renderCell: (params: any) => {
      const IconComponent = scmProviderIcons[params.row.provider as string];
      const redirectURL = `${params.row.entityUrl}/apiiro`;
      return (
        <SimpleTooltip title={params.formattedValue || ''}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              width: '100%',
              minWidth: 0,
            }}
          >
            {IconComponent && <IconComponent style={{ flexShrink: 0 }} />}
            <Link
              to={redirectURL}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                flex: 1,
              }}
            >
              {params.formattedValue}
            </Link>
          </div>
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'visibility',
    headerName: 'Public/Private',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => (row.isPublic ? 'Public' : 'Private'),
    renderCell: (params: any) => (
      <SimpleTooltip
        title={params.formattedValue || ''}
        centered
        tooltipProps={{
          PopperProps: {
            modifiers: [{ name: 'offset', options: { offset: [0, -20] } }],
          },
        }}
      >
        {params.formattedValue}
      </SimpleTooltip>
    ),
  },
  {
    field: 'businessImpact',
    headerName: 'Business Impact',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        <Chip
          label={params.value}
          colorMapping={businessImpactColorMapping}
          size="small"
          variant="outlined"
          sx={{ marginBottom: '0' }}
        />
      </SimpleTooltip>
    ),
  },
  {
    field: 'riskLevel',
    headerName: 'Risk Level',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        <RiskLevel level={params.value} iconSize="large" />
      </SimpleTooltip>
    ),
  },
  {
    field: 'riskScore',
    headerName: 'Risk Score',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'languages',
    headerName: 'Languages',
    flex: 1.5,
    minWidth: 180,
    valueGetter: (_, row) => row.languages,
    renderCell: (params: any) => {
      const languagesList = params.value?.join(', ') || '';
      return (
        <SimpleTooltip title={languagesList}>
          <ChipsList
            items={params.value.map((item: any) => ({
              id: item,
              label: item,
            }))}
            maxVisible={2}
            gap={0}
            variant="outlined"
          />
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'isDeployed',
    headerName: 'Deployed',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => (row.isDeployed ? 'Yes' : 'No'),
    renderCell: (params: any) => (
      <SimpleTooltip title={params.formattedValue || ''} centered>
        {params.formattedValue}
      </SimpleTooltip>
    ),
  },
  {
    field: 'isInternetExposed',
    headerName: 'Internet Exposed',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => (row.isInternetExposed ? 'Yes' : 'No'),
    renderCell: (params: any) => (
      <SimpleTooltip title={params.formattedValue || ''} centered>
        {params.formattedValue}
      </SimpleTooltip>
    ),
  },
  {
    field: 'apiCount',
    headerName: 'APIs',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'sensitiveData',
    headerName: 'Sensitive Data',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => {
      const sensitiveTypes = [];
      if (params.row.hasPiiData) sensitiveTypes.push('PII');
      if (params.row.hasPhiData) sensitiveTypes.push('PHI');
      if (params.row.hasPaymentsData) sensitiveTypes.push('Payments');
      const displayValue = sensitiveTypes.length > 0 ? 'Yes' : 'No';
      const tooltipText =
        sensitiveTypes.length > 0
          ? `Contains: ${sensitiveTypes.join(', ')}`
          : 'No sensitive data';
      return (
        <SimpleTooltip title={tooltipText} centered>
          <Typography>{displayValue}</Typography>
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'contributorCount',
    headerName: 'Contributors',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'activeSince',
    headerName: 'Active Since',
    type: 'date',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) =>
      row.activeSince ? new Date(row.activeSince) : null,
    renderCell: (params: any) => (
      <SimpleTooltip
        title={params.value?.toLocaleDateString() || 'N/A'}
        centered
      >
        {params.value ? formatDate(params.value.toLocaleDateString()) : 'N/A'}
      </SimpleTooltip>
    ),
  },
  {
    field: 'lastActivity',
    headerName: 'Last Activity',
    type: 'date',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) =>
      row.lastActivity ? new Date(row.lastActivity) : null,
    renderCell: (params: any) => (
      <SimpleTooltip
        title={params.value?.toLocaleDateString() || 'N/A'}
        centered
      >
        {params.value ? formatDate(params.value.toLocaleDateString()) : 'N/A'}
      </SimpleTooltip>
    ),
  },
  {
    field: 'isArchived',
    headerName: 'Archived',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    valueGetter: (_, row) => (row.isArchived ? 'Yes' : 'No'),
    renderCell: (params: any) => (
      <SimpleTooltip title={params.formattedValue || ''} centered>
        {params.formattedValue}
      </SimpleTooltip>
    ),
  },
];

export const columnVisibilityModal = {
  name: true,
  visibility: true,
  businessImpact: true,
  riskLevel: true,
  riskScore: true,
  languages: true,
  isDeployed: false,
  isInternetExposed: false,
  apiCount: false,
  sensitiveData: false,
  contributorCount: false,
  activeSince: false,
  lastActivity: false,
  isArchived: false,
};
