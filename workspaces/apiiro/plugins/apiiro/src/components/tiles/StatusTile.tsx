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
import { FONT_FAMILY } from '../../theme/fonts';
import { Link } from 'react-router-dom';
import { ApiiroLogo } from '../../assets/apiiroLogo';
import { formatNumberWithSuffix } from '../../utils';
import {
  formatActivityTooltip,
  getDevelopmentDuration,
} from '../../utils/dateFormatter';
import { RepositoryType } from '../../queries/queries.type';
import { CustomTooltip, NotFound } from '../common';
import { generateRepoURL, scmProviderIcons } from '../common/scmProviders';
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';
import SettingIcon from '../../assets/SettingIcon';

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

const StatusIndicator = styled('span')(
  ({ isActive }: { isActive: boolean }) => ({
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: isActive ? '#11e4cb' : '#c4c7d4',
    marginRight: 8,
  }),
);

export interface StatusTileProps {
  title?: string;
  width?: string | number;
  height?: string | number;
  repository: RepositoryType;
  detailViewLink?: string | null;
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
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

const StatusValue = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

const BranchLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  fontWeight: 500,
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
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  fontWeight: 500,
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
  fontFamily: FONT_FAMILY,
  color: theme.palette.text.primary,
}));

const LogoContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '12px 15px',
  gap: '10px',
  width: '109px',
  height: '40px',
  background: '#E6E6E6',
  borderRadius: '10px',
  '& svg': {
    width: '79px',
    height: '22px',
    '& path': {
      fill: '#21263F',
    },
  },
}));

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
  detailViewLink = null,
}: StatusTileProps) => {
  // Show message when no data is available
  if (Object.keys(repository).length === 0) {
    return (
      <StatusBox width={width} height={height} alignContent="flex-start">
        <CustomHeaderData title="" />
        <NotFound message="Results for this repository are either unavailable on Apiiro or cannot be accessed." />
      </StatusBox>
    );
  }

  const ProviderIconComponent = scmProviderIcons[repository.provider as string];
  const apiiroRepoUrl = `${APIIRO_DEFAULT_BASE_URL}/profiles/repositories/${repository.key}`;
  const settingsUrl = `${apiiroRepoUrl}/profile/${repository.scmRepositoryKey}/multi-branch`;

  return (
    <StatusBox width={width} height={height} alignContent="flex-start">
      <CustomHeaderData title={title} />
      <StatusContent>
        {repository?.lastActivity && repository?.activeSince && (
          <CustomTooltip
            title={formatActivityTooltip(
              repository.lastActivity,
              repository.activeSince,
            )}
            placement="bottom"
          >
            <StatusRow>
              <StatusLabel>Activity:</StatusLabel>
              <StatusValue>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator isActive={repository.isActive} />
                  {repository.isActive
                    ? `In development for ${getDevelopmentDuration(
                        repository.activeSince,
                      )}`
                    : 'Inactive'}
                </Box>
              </StatusValue>
            </StatusRow>
          </CustomTooltip>
        )}
        <CustomTooltip
          title="A weighted value based on the number of risks at each severity level."
          placement="top"
        >
          <StatusRow>
            <StatusLabel>Risk score:</StatusLabel>
            <StatusValue>
              {formatNumberWithSuffix(repository.riskScore)}
            </StatusValue>
          </StatusRow>
        </CustomTooltip>
        <StatusRow>
          {ProviderIconComponent && (
            <ThemedIcon>
              <ProviderIconComponent />
            </ThemedIcon>
          )}
          <BranchLink
            to={generateRepoURL(repository) || ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`Analyzing ${repository.branchName} branch`}
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
        <ActionLinks>
          <ActionLink
            to={apiiroRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Apiiro →
          </ActionLink>
          {detailViewLink && (
            <ActionLink to={detailViewLink}>Detail View →</ActionLink>
          )}
        </ActionLinks>
      </StatusContent>
    </StatusBox>
  );
};

export default StatusTile;
