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
import { CustomTooltip } from '../common/CustomTooltip';
import { FONT_FAMILY } from '../../theme/fonts';

interface Application {
  apiiroUrl: string;
  businessImpact: string;
  id: string;
  name: string;
}

interface ApplicationsListProps {
  applications: Application[];
  maxVisible?: number;
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

export const ApplicationsList = ({
  applications,
  maxVisible = 1,
}: ApplicationsListProps) => {
  if (!applications || applications.length === 0) {
    return '';
  }

  const visibleApplications = applications.slice(0, maxVisible);
  const remainingCount = applications.length - maxVisible;

  const renderApplication = (app: Application) => {
    const applicationElement = (
      <Box
        key={app.id}
        display="flex"
        alignItems="center"
        gap={0.5}
        justifyContent="center"
      >
        <Link
          href={app.apiiroUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'inherit',
            fontSize: '0.875rem',
            fontFamily: FONT_FAMILY,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {app.name}
        </Link>
        <Chip
          label={app.businessImpact}
          size="small"
          variant="outlined"
          style={{
            borderColor: getBusinessImpactColor(app.businessImpact),
            color: getBusinessImpactColor(app.businessImpact),
            backgroundColor: 'transparent',
            fontSize: '0.75rem',
            height: 20,
            fontWeight: 500,
          }}
        />
      </Box>
    );

    // Wrap with tooltip showing application details
    return (
      <SimpleTooltip
        key={app.id}
        title={
          <Box display="flex" alignItems="center" gap={0.5}>
            <Link
              href={app.apiiroUrl}
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
              {app.name}
            </Link>
            <Chip
              label={app.businessImpact}
              size="small"
              variant="outlined"
              style={{
                borderColor: getBusinessImpactColor(app.businessImpact),
                color: getBusinessImpactColor(app.businessImpact),
                backgroundColor: 'transparent',
                fontSize: '0.75rem',
                height: 20,
                fontWeight: 500,
              }}
            />
          </Box>
        }
      >
        {applicationElement}
      </SimpleTooltip>
    );
  };

  const getTooltipContent = () => {
    const remainingApplications = applications.slice(maxVisible);
    return (
      <Box>
        {remainingApplications.map((app, index) => (
          <Box
            key={app.id}
            mb={index < remainingApplications.length - 1 ? 1 : 0}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Link
                href={app.apiiroUrl}
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
                {app.name}
              </Link>
              <Chip
                label={app.businessImpact}
                size="small"
                variant="outlined"
                style={{
                  borderColor: getBusinessImpactColor(app.businessImpact),
                  color: getBusinessImpactColor(app.businessImpact),
                  backgroundColor: 'transparent',
                  fontSize: '0.75rem',
                  height: 20,
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      {visibleApplications.map(app => renderApplication(app))}

      {remainingCount > 0 && (
        <CustomTooltip
          title={getTooltipContent()}
          placement="top"
          enterDelay={200}
          leaveDelay={300}
          disableInteractive={false}
        >
          <Chip
            label={`+${remainingCount}`}
            size="small"
            variant="outlined"
            style={{
              fontSize: '0.75rem',
              height: 20,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        </CustomTooltip>
      )}
    </Box>
  );
};
