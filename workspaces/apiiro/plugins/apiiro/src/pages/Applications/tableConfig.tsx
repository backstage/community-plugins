/*
 * Copyright 2026 The Backstage Authors
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
import { Chip, RiskLevel, SimpleTooltip } from '../../components';

// Color mapping for business impact
export const businessImpactColorMapping = {
  High: 'error',
  Medium: 'warning',
  Low: 'warning',
} as const;

// Application columns configuration
export const applicationColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Application Name',
    flex: 1.5,
    hideable: false,
    minWidth: 230,
    renderCell: (params: any) => {
      const redirectURL = `${params.row.entityUrl}/apiiro`;
      return (
        <SimpleTooltip title={params.value || ''}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              width: '100%',
              minWidth: 0,
            }}
          >
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
              {params.value}
            </Link>
          </div>
        </SimpleTooltip>
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 2,
    minWidth: 250,
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''}>
        {params.value ?? ''}
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
          chipSx={{ marginBottom: '0' }}
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
    minWidth: 120,
    headerAlign: 'center',
    renderCell: (params: any) => (
      <SimpleTooltip title={params.value ?? ''} centered>
        {params.value ?? ''}
      </SimpleTooltip>
    ),
  },
  {
    field: 'isActive',
    headerName: 'Status',
    flex: 1,
    minWidth: 120,
    headerAlign: 'center',
    valueGetter: (_, row) => (row.isActive ? 'Active' : 'Inactive'),
    renderCell: (params: any) => (
      <SimpleTooltip title={params.formattedValue || ''} centered>
        {params.formattedValue}
      </SimpleTooltip>
    ),
  },
];

export const applicationColumnVisibility = {
  name: true,
  description: true,
  businessImpact: true,
  riskLevel: true,
  riskScore: true,
  isActive: true,
};
