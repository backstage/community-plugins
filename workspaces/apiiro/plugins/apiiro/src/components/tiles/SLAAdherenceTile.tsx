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
import { useTheme } from '@mui/material/styles';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { getSlaColors } from '../../theme/themeUtils';
import { ChartBox } from '../common/ChartBox';
import ColumnChart, { ColumnData } from '../charts/ColumnChart';
import { useSlaBreachData } from '../../queries/sla-breach.queries';
import { apiiroApiRef } from '../../api';
import { SlaBreachDataPoint } from '../../queries/queries.type';
import { NotFound, SomethingWentWrong } from '../common';
import { LogoSpinner } from '../common/logoSpinner';

export interface SLAAdherenceData {
  category: string;
  slaBreaches: number;
  slaAdherence: number;
  dueDateNotSet: number;
}

export interface SLAAdherenceTileProps {
  title?: string;
  tooltip?: string;
  data?: SLAAdherenceData[];
  width?: string | number;
  height?: string | number;
  repoId?: string;
  entityRef?: string;
}

export const SLAAdherenceTile = ({
  title = 'SLA adherence',
  data = [],
  width = '100%',
  height = '366px',
  repoId,
  entityRef,
}: SLAAdherenceTileProps) => {
  // Use API hooks internally
  const theme = useTheme();
  const slaColors = getSlaColors(theme);
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);

  // Always call the hook, but conditionally use the result
  const { slaBreachData, slaBreachDataError, slaBreachDataLoading } =
    useSlaBreachData({
      connectApi: connectBackendApi,
      fetchApi: fetch,
      repositoryKey: repoId,
      entityRef: entityRef,
    });

  // Show loading state while data is loading (Query check - loading)
  if (slaBreachDataLoading) {
    return (
      <ChartBox title={title} width={width} height={height}>
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

  // Show error state if there's an error (Query check - error)
  if (slaBreachDataError) {
    return (
      <ChartBox title={title} width={width}>
        <SomethingWentWrong />
      </ChartBox>
    );
  }

  // Show message when no repository key is provided
  if (!repoId) {
    return (
      <ChartBox title={title} width={width} height={height}>
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

  // Transform API data to component data format
  const finalData: SLAAdherenceData[] = slaBreachData
    ? slaBreachData.map((point: SlaBreachDataPoint) => ({
        category: point.riskLevel,
        slaBreaches: point.slaBreach,
        slaAdherence: point.slaAdherence,
        dueDateNotSet: point.unsetDueDate,
      }))
    : data;

  // Total data length check
  if (finalData.length === 0) {
    return (
      <ChartBox title={title} width={width} height={height}>
        <NotFound />
      </ChartBox>
    );
  }

  // Check if all values are zero (slaBreach, slaAdherence, and unsetDueDate)
  const hasAllZeroValues = slaBreachData!.every(
    (point: SlaBreachDataPoint) =>
      point.slaBreach === 0 &&
      point.slaAdherence === 0 &&
      point.unsetDueDate === 0,
  );

  // If all zero, send NotFound
  if (hasAllZeroValues) {
    return (
      <ChartBox title={title} width={width} height={height}>
        <NotFound />
      </ChartBox>
    );
  }

  // Calculate chart width based on container
  const getChartWidth = () => {
    if (typeof width === 'string' && width.includes('%')) {
      // For percentage widths, assume a reasonable container width
      return 400; // This will be responsive within the container
    }
    return typeof width === 'number' ? width - 40 : 400; // Leave some padding
  };

  // Transform data for ColumnChart
  const columnData: ColumnData[] = finalData.map(item => ({
    category: item.category,
    values: [
      {
        label: 'SLA breaches',
        value: item.slaBreaches,
        color: slaColors.breach,
      },
      {
        label: 'SLA adherence',
        value: item.slaAdherence,
        color: slaColors.adherence,
      },
      {
        label: 'Due date not set',
        value: item.dueDateNotSet,
        color: slaColors.notSet,
      },
    ],
  }));

  return (
    <ChartBox title={title} width={width} height={height}>
      <ColumnChart
        data={columnData}
        width={getChartWidth()}
        height={300}
        showLegend
        legendPosition="bottom"
      />
    </ChartBox>
  );
};

export default SLAAdherenceTile;
