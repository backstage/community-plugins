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
import { useTheme, Theme } from '@mui/material/styles';
import { SimpleTooltip } from '../SimpleTooltip';
import { CustomTooltip } from '../common/CustomTooltip';
import { getBusinessImpactColors } from '../../theme/themeUtils';

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

const getBusinessImpactColor = (impact: string, theme: Theme): string => {
  const impactColors = getBusinessImpactColors(theme);
  switch (impact.toLowerCase()) {
    case 'high':
      return impactColors.high;
    case 'medium':
      return impactColors.medium;
    case 'low':
      return impactColors.low;
    default:
      return impactColors.default;
  }
};

export const ApplicationsList = ({
  applications,
  maxVisible = 1,
}: ApplicationsListProps) => {
  const theme = useTheme();

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
            borderColor: getBusinessImpactColor(app.businessImpact, theme),
            color: getBusinessImpactColor(app.businessImpact, theme),
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
                borderColor: getBusinessImpactColor(app.businessImpact, theme),
                color: getBusinessImpactColor(app.businessImpact, theme),
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
                  borderColor: getBusinessImpactColor(
                    app.businessImpact,
                    theme,
                  ),
                  color: getBusinessImpactColor(app.businessImpact, theme),
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
