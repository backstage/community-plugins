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
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import {
  getActivityStatusColors,
  getLogoContainerColors,
} from '../../theme/themeUtils';
import { Link } from 'react-router-dom';
import { ApiiroLogo } from '../../assets/apiiroLogo';
import { formatNumberWithSuffix } from '../../utils';
import {
  formatActivityTooltip,
  getDevelopmentDuration,
} from '../../utils/dateFormatter';
import { RepositoryType, ApplicationType } from '../../queries/queries.type';
import { CustomTooltip, NotFound } from '../common';
import { generateRepoURL, scmProviderIcons } from '../common/scmProviders';
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';
import SettingIcon from '../../assets/SettingIcon';
import { useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';

const ThemedIcon = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  '& svg': {
    color: theme.palette.text.primary,
    flexShrink: 0,
  },
  '&:hover svg': {
    color: theme.palette.primary.main,
  },
}));

const StatusIndicator = styled('span')<{ isActive: boolean }>(
  ({ theme, isActive }) => {
    const activityColors = getActivityStatusColors(theme);
    return {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: isActive
        ? activityColors.active
        : activityColors.inactive,
      marginRight: 8,
    };
  },
);

export interface StatusTileProps {
  title?: string;
  width?: string | number;
  height?: string | number;
  repository?: RepositoryType;
  application?: ApplicationType;
  detailViewLink?: string | null;
  allowViewChart?: boolean;
}

export const StatusBox = styled(Box)<{
  width?: string | number;
  height?: string | number;
}>(({ theme, width, height }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  width: width || 'fit-content',
  height: height || 'auto',
  margin: width === '100%' ? '0' : '0 auto',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
}));

const StatusContent = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '16px',
}));

const StatusRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StatusLabel = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

const StatusValue = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: theme.palette.text.primary,
}));

const BranchLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 400,
  color: theme.palette.info.main,
  textDecoration: 'underline',
  cursor: 'pointer',
}));

const ActionLinks = styled(Box)(() => ({
  display: 'flex',
  gap: '16px',
  marginTop: '8px',
}));

const ActionLink = styled(Link)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: theme.palette.info.main,
  textDecoration: 'none',
  cursor: 'pointer',
}));

const CustomHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
}));

const TitleContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingLeft: '16px',
  paddingTop: '16px',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  color: theme.palette.text.primary,
}));

const LogoContainer = styled(Box)(({ theme }) => {
  const logoColors = getLogoContainerColors(theme);
  return {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 15px',
    gap: '10px',
    width: '109px',
    height: '40px',
    background: logoColors.background,
    borderRadius: '10px',
    '& svg': {
      width: '79px',
      height: '22px',
      '& path': {
        fill: logoColors.logoFill,
      },
    },
  };
});

const CustomHeaderData = ({ title }: { title: string }) => (
  <CustomHeader>
    <TitleContainer>
      <StyledTitle>{title}</StyledTitle>
    </TitleContainer>
    <LogoContainer>
      <ApiiroLogo />
    </LogoContainer>
  </CustomHeader>
);

export const StatusTile = ({
  title = 'Status',
  width = '100%',
  height = 'auto',
  repository,
  application,
  detailViewLink = null,
  allowViewChart = true,
}: StatusTileProps) => {
  const isApplication = !!application;
  const data = isApplication ? application : repository;
  const connectApi = useApi(apiiroApiRef);
  const redirectDevView = connectApi.getRedirectDevView();

  // Show message when no data is available
  if (!data || Object.keys(data).length === 0) {
    return (
      <StatusBox width={width} height={height} alignContent="flex-start">
        <CustomHeaderData title="" />
        <NotFound
          message={`Results for this ${
            isApplication ? 'application' : 'repository'
          } are either unavailable on Apiiro or can not be accessed.`}
        />
      </StatusBox>
    );
  }

  // Determine Apiiro URL based on type
  const profileType = isApplication ? 'applications' : 'repositories';
  const profileKey = isApplication ? application!.key : repository!.key;
  const apiiroUrl = `${APIIRO_DEFAULT_BASE_URL}/profiles/${profileType}/${profileKey}`;

  const queryParams = redirectDevView ? '?devView=true' : '';
  const actionUrl = `${apiiroUrl}/risk/development${queryParams}`;

  // Render Activity Row
  const renderActivityRow = () => {
    if (isApplication) {
      if (application!.isActive === undefined) return null;
      return (
        <StatusRow>
          <StatusLabel>Activity:</StatusLabel>
          <StatusValue>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StatusIndicator isActive={application!.isActive} />
              {application!.isActive ? 'Active' : 'Inactive'}
            </Box>
          </StatusValue>
        </StatusRow>
      );
    }

    // Repository activity with tooltip
    if (!repository!.lastActivity || !repository!.activeSince) return null;
    return (
      <CustomTooltip
        title={formatActivityTooltip(
          repository!.lastActivity,
          repository!.activeSince,
        )}
        placement="bottom"
      >
        <StatusRow>
          <StatusLabel>Activity:</StatusLabel>
          <StatusValue>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StatusIndicator isActive={repository!.isActive} />
              {repository!.isActive
                ? `In development for ${getDevelopmentDuration(
                    repository!.activeSince,
                  )}`
                : 'Inactive'}
            </Box>
          </StatusValue>
        </StatusRow>
      </CustomTooltip>
    );
  };

  // Render Risk Score Row (common for both)
  const renderRiskScoreRow = () => {
    const riskScore = isApplication
      ? application!.riskScore ?? 0
      : repository!.riskScore;
    return (
      <CustomTooltip
        title="A weighted value based on the number of risks at each severity level."
        placement="top"
      >
        <StatusRow>
          <StatusLabel>Risk score:</StatusLabel>
          <StatusValue>{formatNumberWithSuffix(riskScore)}</StatusValue>
        </StatusRow>
      </CustomTooltip>
    );
  };

  // Render Repository-specific Branch Row
  const renderBranchRow = () => {
    if (isApplication) return null;

    const ProviderIconComponent =
      scmProviderIcons[repository!.provider as string];
    const settingsUrl = `${apiiroUrl}/profile/${
      repository!.scmRepositoryKey
    }/multi-branch`;

    return (
      <StatusRow>
        {ProviderIconComponent && (
          <ThemedIcon>
            <ProviderIconComponent />
          </ThemedIcon>
        )}
        <BranchLink
          to={generateRepoURL(repository!) || ''}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`Analyzing ${repository!.branchName} branch`}
        </BranchLink>
        <Link
          to={settingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', marginLeft: '4px' }}
        >
          <SettingIcon />
        </Link>
      </StatusRow>
    );
  };

  // Render Action Links (common for both)
  const renderActionLinks = () => (
    <ActionLinks>
      {allowViewChart && (
        <ActionLink to={actionUrl} target="_blank" rel="noopener noreferrer">
          Go to Apiiro →
        </ActionLink>
      )}
      {detailViewLink && (
        <ActionLink to={detailViewLink}>Detail View →</ActionLink>
      )}
    </ActionLinks>
  );

  return (
    <StatusBox width={width} height={height} alignContent="flex-start">
      <CustomHeaderData title={title} />
      <StatusContent>
        {renderActivityRow()}
        {renderRiskScoreRow()}
        {renderBranchRow()}
        {renderActionLinks()}
      </StatusContent>
    </StatusBox>
  );
};

export default StatusTile;
