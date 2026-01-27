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
import { styled } from '@mui/material/styles';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { ChartBox } from '../common/ChartBox';
import GaugeChart, { GaugeBottomLabels } from '../charts/GaugeChart';
import { useMttrStatisticsData } from '../../queries/mttr-statistics.queries';
import { apiiroApiRef } from '../../api';
import { MttrStatistic } from '../../queries/queries.type';
import { NotFound, SomethingWentWrong } from '../common';
import { LogoSpinner } from '../common/logoSpinner';

interface GaugeData {
  value: number;
  tickValue: number;
  minValue: number;
  maxValue: number;
  categoryLabel: string;
  tooltip?: string;
  unit?: string;
  displayValue?: number;
  displayTickValue?: number;
  displayMinValue?: number;
  displayMaxValue?: number;
}

interface MttrVsSLATileProps {
  title?: string;
  tooltip?: string;
  gauges?: GaugeData[];
  footerText?: string;
  width?: string | number;
  height?: string | number;
  repoId?: string;
  entityRef?: string;
}

const GaugesGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  justifyItems: 'center',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
  maxWidth: '100%',
  margin: '0 auto',
  '@media (max-width: 320px)': {
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
}));

const GaugeContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 0,
  position: 'relative',
  '&:hover': {
    zIndex: 10,
  },
}));

const FooterText = styled('p')(({ theme }) => ({
  fontSize: '11px',
  color: theme.palette.text.secondary,
  fontWeight: 400,
  lineHeight: 1.2,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center',
}));

const transformMttrStatisticsToGauges = (
  statistics: MttrStatistic[],
): GaugeData[] => {
  const convertHoursForDisplay = (
    hours: number,
  ): { displayValue: number; unit: string } => {
    if (hours > 23) {
      return {
        displayValue: Math.ceil(hours / 24),
        unit: 'Days',
      };
    }
    return {
      displayValue: Math.ceil(hours),
      unit: 'Hours',
    };
  };

  // Define the desired order: Medium, Low, High, Critical
  const riskLevelOrder = ['Critical', 'High', 'Medium', 'Low'];

  // Sort statistics according to the desired order
  const sortedStatistics = statistics.sort((a, b) => {
    const aIndex = riskLevelOrder.indexOf(a.riskLevel);
    const bIndex = riskLevelOrder.indexOf(b.riskLevel);

    // If risk level not found in order array, put it at the end
    const aOrder = aIndex === -1 ? riskLevelOrder.length : aIndex;
    const bOrder = bIndex === -1 ? riskLevelOrder.length : bIndex;

    return aOrder - bOrder;
  });

  return sortedStatistics.map(stat => {
    const meanTimeDisplay = convertHoursForDisplay(stat.meanTimeInHours);
    const slaDisplay = convertHoursForDisplay(stat.slaInHours);

    // Use the unit from the mean time (primary value)
    const unit = meanTimeDisplay.unit;

    // Use original hours for arc scaling, but display converted values for labels
    const maxHours = Math.max(stat.meanTimeInHours, stat.slaInHours) + 24;
    const maxDisplay = convertHoursForDisplay(maxHours);

    return {
      value:
        unit === 'Days'
          ? meanTimeDisplay.displayValue * 24
          : Math.ceil(stat.meanTimeInHours), // Original hours for arc scaling
      tickValue:
        unit === 'Days'
          ? slaDisplay.displayValue * 24
          : Math.ceil(stat.slaInHours), // Original hours for arc scaling
      minValue: 0,
      maxValue:
        unit === 'Days' ? maxDisplay.displayValue * 24 : Math.ceil(maxHours),
      categoryLabel: stat.riskLevel,
      tooltip: `View ${stat.riskLevel} risks out of SLA`,
      unit: unit,
      displayValue: meanTimeDisplay.displayValue, // Converted value for center display
      displayTickValue: slaDisplay.displayValue, // Converted value for tick display
      displayMinValue: 0, // Min is always 0
      displayMaxValue: maxDisplay.displayValue, // Converted max value for bottom labels
    };
  });
};

export const MttrVsSLATile = ({
  title = 'MTTR vs. SLA',
  tooltip = 'The scale is set dynamically according to the SLA definition',
  gauges = [],
  footerText = '*SLA (days)',
  width = '100%',
  repoId,
  entityRef,
}: MttrVsSLATileProps) => {
  // Use API hooks internally
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);

  // Always call the hook, but conditionally use the result
  const {
    mttrStatisticsData,
    mttrStatisticsDataError,
    mttrStatisticsDataLoading,
  } = useMttrStatisticsData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
    repositoryKey: repoId,
    entityRef: entityRef,
  });
  // Only use API data if repositoryKey is provided
  const shouldUseApiData = !!repoId;

  // Transform API data to gauge data if available and should be used
  const apiGauges =
    shouldUseApiData && mttrStatisticsData
      ? transformMttrStatisticsToGauges(mttrStatisticsData)
      : null;

  // Use API data if available, otherwise fall back to provided gauges
  const finalGauges = apiGauges || gauges;

  const footer =
    footerText && !mttrStatisticsDataLoading ? (
      <FooterText>{footerText}</FooterText>
    ) : undefined;

  // Show loading state if API is being used and data is loading
  if (shouldUseApiData && mttrStatisticsDataLoading) {
    return (
      <ChartBox title={title} tooltip={tooltip} footer={footer} width={width}>
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

  // Show error state if API is being used and there's an error
  if (shouldUseApiData && mttrStatisticsDataError) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
        <SomethingWentWrong />
      </ChartBox>
    );
  }

  // Show message when no data is available
  if (finalGauges.length === 0) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
        {repoId ? (
          <NotFound />
        ) : (
          <NotFound message="Please provide the repository details to access the data." />
        )}
      </ChartBox>
    );
  }

  return (
    <ChartBox title={title} tooltip={tooltip} footer={footer} width={width}>
      <GaugesGrid>
        {finalGauges.map((gauge, index) => (
          <GaugeContainer key={index}>
            <GaugeChart
              width={200}
              height={180}
              value={gauge.value}
              tickValue={gauge.tickValue}
              minValue={gauge.minValue}
              maxValue={gauge.maxValue}
              tooltip={gauge.tooltip}
              unit={gauge.unit}
              displayValue={gauge.displayValue}
              displayTickValue={gauge.displayTickValue}
            />
            <GaugeBottomLabels
              minValue={gauge.displayMinValue ?? gauge.minValue}
              maxValue={gauge.displayMaxValue ?? gauge.maxValue}
              categoryLabel={gauge.categoryLabel}
              width="130px"
            />
          </GaugeContainer>
        ))}
      </GaugesGrid>
    </ChartBox>
  );
};

export default MttrVsSLATile;
