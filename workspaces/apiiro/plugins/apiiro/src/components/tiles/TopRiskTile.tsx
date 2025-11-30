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
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { ChartBox } from '../common/ChartBox';
import { useTopRisksData } from '../../queries/top-risks.queries';
import { apiiroApiRef } from '../../api';
import { TopRiskDataPoint } from '../../queries/queries.type';
import { CustomTooltip, NotFound, SomethingWentWrong } from '../common';
import { LogoSpinner } from '../common/logoSpinner';
import { FONT_FAMILY } from '../../theme/fonts';
import { commonRiskColorMappings, RiskLevel } from '../RiskLevel';
import { ApiiroSmall } from '../../assets/apiiroLogo';

export interface TopRiskData {
  ruleName: string;
  count: number;
  severity: string;
  devPhase: string;
}

export interface TopRiskTileProps {
  title?: string;
  tooltip?: string;
  data?: TopRiskData[];
  width?: string | number;
  height?: string | number;
  repoId?: string;
  entityRef?: string;
}

const RiskListContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  padding: '0 8px',
}));

const RiskItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '14px',
  border: `1px solid ${theme.palette.divider}`,
  minHeight: '48px',
  gap: '12px',
  cursor: 'pointer',
  transition: 'box-shadow 200ms ease-in-out',

  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
}));

const RiskContent = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0, // Allow text truncation
  overflow: 'hidden', // Ensure container doesn't overflow
}));

const TooltipWrapper = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  display: 'flex',
}));

const RiskName = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_FAMILY,
  fontSize: '14px',
  fontWeight: 400,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
}));

const RiskCount = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  fontWeight: 500,
  color: theme.palette.text.primary,
  minWidth: 'fit-content',
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
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  fontFamily: FONT_FAMILY,
  color: theme.palette.text.primary,
}));

export const TopRiskTile = ({
  title = 'Top risks',
  data = [],
  width = '100%',
  height = '366px',
  repoId,
  entityRef,
}: TopRiskTileProps) => {
  const customHeader = (
    <CustomHeader>
      <TitleContainer>
        <StyledTitle>{title}</StyledTitle>
        <ApiiroSmall sx={{ width: 20, height: 20, color: 'text.primary' }} />
      </TitleContainer>
    </CustomHeader>
  );
  // Use API hooks internally
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);

  // Always call the hook, but conditionally use the result
  const { topRisksData, topRisksDataError, topRisksDataLoading } =
    useTopRisksData({
      connectApi: connectBackendApi,
      fetchApi: fetch,
      repoId,
      entityRef,
    });

  // Transform API data to component data format
  const finalData: TopRiskData[] = topRisksData
    ? topRisksData.map((point: TopRiskDataPoint) => ({
        ruleName: point.ruleName,
        count: point.count,
        severity: point.severity,
        devPhase: point.devPhase,
      }))
    : data;

  // Show loading state while data is loading
  if (topRisksDataLoading) {
    return (
      <ChartBox
        title={title}
        width={width}
        height={height}
        customHeader={customHeader}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="250px"
        >
          <LogoSpinner />
        </Box>
      </ChartBox>
    );
  }

  // Show error state if there's an error
  if (topRisksDataError) {
    return (
      <ChartBox
        title={title}
        width={width}
        height={height}
        customHeader={customHeader}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <SomethingWentWrong />
        </Box>
      </ChartBox>
    );
  }

  // Show message when no repository key is provided
  if (!repoId) {
    return (
      <ChartBox
        title={title}
        width={width}
        height={height}
        customHeader={customHeader}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <NotFound message="Please provide the repository details to access the data." />
        </Box>
      </ChartBox>
    );
  }

  // Show message when no data is available
  if (finalData.length === 0) {
    return (
      <ChartBox
        title={title}
        width={width}
        height={height}
        customHeader={customHeader}
      >
        <NotFound />
      </ChartBox>
    );
  }

  return (
    <ChartBox
      title={title}
      width={width}
      height={height}
      customHeader={customHeader}
    >
      <RiskListContainer>
        {finalData.map((risk, index) => (
          <RiskItem key={`${risk.ruleName}-${index}`}>
            <RiskContent>
              <RiskLevel
                level={risk.severity}
                colorMapping={commonRiskColorMappings.standard}
                iconSize="large"
              />
              <TooltipWrapper>
                <CustomTooltip title={risk.ruleName}>
                  <RiskName>{risk.ruleName}</RiskName>
                </CustomTooltip>
              </TooltipWrapper>
            </RiskContent>
            <RiskCount>{risk.count}</RiskCount>
          </RiskItem>
        ))}
      </RiskListContainer>
    </ChartBox>
  );
};

export default TopRiskTile;
