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
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import { SimpleTooltip } from '../SimpleTooltip';
import { scmProviderIcons } from '../../utils/utils';

interface Repository {
  details: {
    branchName: string;
    businessImpact: string;
    isArchived: boolean;
    key: string;
    monitoringStatus: {
      ignoredBy: string | null;
      ignoredOn: string | null;
      ignoreReason: string | null;
      status: string;
    };
    name: string;
    privacySettings: string;
    profileUrl: string;
    repositoryGroup: string;
    repositoryOwners: any[];
    riskLevel: string;
    serverUrl: string;
    url: string;
    provider?: string; // SCM provider (Github, Gitlab, etc.)
  };
  type: string;
}

interface RepositoryDisplayProps {
  entity: Repository;
}

const getBusinessImpactColor = (impact: string): string => {
  switch (impact.toLowerCase()) {
    case 'high':
      return '#d32f2f'; // Red
    case 'medium':
      return '#f57c00'; // Orange
    case 'low':
      return '#388e3c'; // Green
    default:
      return '#757575'; // Grey
  }
};

const getScmProvider = (serverUrl: string, provider?: string): string => {
  // If provider is explicitly provided, use it
  if (provider) {
    return provider;
  }

  // Otherwise, determine from serverUrl
  const url = serverUrl.toLowerCase();
  if (url.includes('github')) {
    return 'Github';
  } else if (url.includes('gitlab')) {
    return 'Gitlab';
  } else if (url.includes('bitbucket')) {
    return 'BitbucketCloud';
  } else if (url.includes('azure') || url.includes('visualstudio')) {
    return 'AzureDevops';
  }

  // Default to Github if unable to determine
  return 'Github';
};

export const RepositoryDisplay = ({ entity }: RepositoryDisplayProps) => {
  if (!entity || !entity.details) {
    return '';
  }

  const { details } = entity;
  const scmProvider = getScmProvider(details.serverUrl, details.provider);
  const IconComponent = scmProviderIcons[scmProvider];

  const getTooltipContent = () => (
    <Box>
      <Box mb={1}>
        <strong>Server URL:</strong> {details.serverUrl}
      </Box>
      <Box mb={1}>
        <strong>Repository:</strong> {details.name}
      </Box>
      <Box>
        <strong>Branch:</strong> {details.branchName}
      </Box>
    </Box>
  );

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={0.5}
      height="100%"
      width="100%"
    >
      <SimpleTooltip title={getTooltipContent()}>
        <Box display="flex" alignItems="center" gap={0.5}>
          {IconComponent && (
            <IconComponent style={{ fontSize: '1rem', color: '#333' }} />
          )}
          <Link
            href={details.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {details.name}
          </Link>
          <Chip
            label={details.businessImpact}
            size="small"
            variant="outlined"
            style={{
              borderColor: getBusinessImpactColor(details.businessImpact),
              color: getBusinessImpactColor(details.businessImpact),
              backgroundColor: 'transparent',
              fontSize: '0.75rem',
              height: 20,
              fontWeight: 500,
            }}
          />
        </Box>
      </SimpleTooltip>
    </Box>
  );
};
