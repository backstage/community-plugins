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
import { styled, useTheme } from '@mui/material/styles';
import { getTrendColors } from '../../theme/themeUtils';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { ChartBox } from '../common/ChartBox';
import { LineChart, LineChartSeries } from '../charts/LineChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { FONT_FAMILY } from '../../theme/fonts';
import { useRiskScoreOverTimeData } from '../../queries/risk-score-over-time.queries';
import { apiiroApiRef } from '../../api';
import { RiskScoreOverTimeDataPoint } from '../../queries/queries.type';
import { NotFound, SomethingWentWrong } from '../common';
import { LogoSpinner } from '../common/logoSpinner';
import { formatNumberWithSuffix } from '../../utils/numberFormatter';

interface RiskDataPoint {
  date: string;
  riskScore: number;
}

interface RiskOverTimeTileProps {
  title?: string;
  tooltip?: string;
  width?: string | number;
  height?: string | number;
  repoId?: string;
  entityRef?: string;
}

const HeaderContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
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

const PercentageContainer = styled(Box)<{
  backgroundColor: string;
  textColor: string;
}>(({ backgroundColor, textColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: backgroundColor,
  padding: '4px 8px',
  borderRadius: '12px',
  color: textColor,
  fontSize: '14px',
  fontWeight: 500,
}));

// Custom date sorting function for YYYY-MM-DD format
const sortDateStrings = (dates: string[]): string[] => {
  return dates.sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    // Handle invalid dates by putting them at the end
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateA - dateB;
  });
};

const formatRiskScore = (value: number): string => {
  return formatNumberWithSuffix(value, 1);
};

// Format X-axis ticks to show only MM/DD
const formatXAxisDate = (dateStr: string | number): string => {
  if (typeof dateStr !== 'string') return String(dateStr);
  const date = new Date(dateStr);
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return String(dateStr);
  }
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

// Format tooltip header as "D MMM YYYY" (e.g., 7 Oct 2025) with day first and no comma
const formatTooltipDate = (dateStr: string | number): string => {
  if (typeof dateStr !== 'string') return String(dateStr);
  const date = new Date(dateStr);
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return String(dateStr);
  }
  // Use en-GB to ensure day-first order without comma
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const RiskOverTimeTile = ({
  title = 'Risk score over time',
  tooltip = 'Track risk score changes over time',
  width = '100%',
  repoId,
  entityRef,
}: RiskOverTimeTileProps) => {
  // Use API hooks internally
  const theme = useTheme();
  const trendColors = getTrendColors(theme);
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);

  // Always call the hook, but conditionally use the result
  const {
    riskScoreOverTimeData,
    riskScoreOverTimeDataError,
    riskScoreOverTimeDataLoading,
  } = useRiskScoreOverTimeData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
    repositoryKey: repoId,
    entityRef: entityRef,
  });

  // Show loading state while data is loading (Query check - loading)
  if (riskScoreOverTimeDataLoading) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
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
  if (riskScoreOverTimeDataError) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
        <SomethingWentWrong />
      </ChartBox>
    );
  }

  // Show message when no repository key is provided
  if (!repoId) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
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
  const finalData: RiskDataPoint[] = riskScoreOverTimeData
    ? riskScoreOverTimeData.map((point: RiskScoreOverTimeDataPoint) => ({
        date: point.date,
        riskScore: point.count,
      }))
    : [];

  // Total data length check
  if (finalData.length === 0) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
        <NotFound />
      </ChartBox>
    );
  }

  // Check if all data points have zero count
  const hasAllZeroValues = riskScoreOverTimeData!.every(
    (point: RiskScoreOverTimeDataPoint) => point.count === 0,
  );

  // If all zero, send NotFound
  if (hasAllZeroValues) {
    return (
      <ChartBox title={title} tooltip={tooltip} width={width}>
        <NotFound />
      </ChartBox>
    );
  }

  // Calculate percentage change from API data (only when we have valid data)
  const calculatePercentageChange = (data: RiskDataPoint[]): number => {
    if (data.length <= 1) return 0;

    const firstValue = data[0].riskScore ?? 0;
    const lastValue = data[data.length - 1].riskScore ?? 0;
    const difference = lastValue - firstValue;

    // Avoid division by zero
    if (firstValue === 0) {
      return lastValue > 0 ? 100 : 0;
    }

    // Handle negative firstValue edge case
    if (firstValue < 0) {
      // If first value is negative and last is positive, return positive change
      if (lastValue > 0) return 100;
      // If both are negative, calculate relative change
      return (difference / Math.abs(firstValue)) * 100;
    }

    return (difference / firstValue) * 100;
  };

  const calculatedPercentageChange = calculatePercentageChange(finalData);

  // Determine colors based on percentage change
  const isNeutralChange = calculatedPercentageChange === 0;
  const isPositiveChange = calculatedPercentageChange > 0;

  // Set colors based on change type using theme-aware colors
  let lineColor: string;
  let indicatorColor: string;
  let indicatorTextColor: string;
  let TrendIcon: typeof TrendingUpIcon;

  if (isNeutralChange) {
    lineColor = trendColors.neutral.line;
    indicatorColor = trendColors.neutral.background;
    indicatorTextColor = trendColors.neutral.text;
    TrendIcon = RemoveIcon; // Minus/horizontal icon for no trend
  } else if (isPositiveChange) {
    lineColor = trendColors.positive.line;
    indicatorColor = trendColors.positive.background;
    indicatorTextColor = trendColors.positive.text;
    TrendIcon = TrendingUpIcon; // Up icon for positive
  } else {
    lineColor = trendColors.negative.line;
    indicatorColor = trendColors.negative.background;
    indicatorTextColor = trendColors.negative.text;
    TrendIcon = TrendingDownIcon; // Down icon for negative
  }

  // Calculate y-axis range with exactly 6 ticks; top tick equals data maximum
  const calculateYAxisRange = (data: RiskDataPoint[]) => {
    // Safety check: ensure we have data
    if (!data || data.length === 0) {
      return { yMin: 0, yMax: 100 };
    }

    const values = data
      .map(d => d.riskScore)
      .filter(v => !isNaN(v) && isFinite(v));

    // Safety check: ensure we have valid numeric values
    if (values.length === 0) {
      return { yMin: 0, yMax: 100 };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Edge case: both values are zero
    if (minValue === 0 && maxValue === 0) {
      return { yMin: 0, yMax: 10 };
    }

    // Edge case: maxValue is zero but minValue is not (shouldn't happen, but handle it)
    if (maxValue === 0 && minValue < 0) {
      return { yMin: minValue * 1.2, yMax: 10 };
    }

    // Calculate yMin: subtract 15% from minValue, but ensure it doesn't go below 0 for non-negative data
    // If minValue is negative, allow yMin to be negative
    let yMin: number;
    if (minValue >= 0) {
      yMin = Math.max(0, minValue - minValue * 0.15);
    } else {
      yMin = minValue - minValue * 0.15;
    }

    // Calculate yMax: add 1% to maxValue
    // Handle edge case where maxValue is very small (near zero)
    let yMax: number;
    if (maxValue === 0) {
      yMax = 10;
    } else {
      yMax = maxValue + maxValue * 0.01;
    }

    // Edge case: ensure yMin < yMax (shouldn't happen with current logic, but safety check)
    if (yMin >= yMax) {
      if (maxValue === 0) {
        return { yMin: 0, yMax: 10 };
      }
      // If they're equal or reversed, create a small range around maxValue
      yMin = Math.max(0, maxValue * 0.9);
      yMax = maxValue * 1.1;
    }

    return { yMin, yMax };
  };

  const { yMin, yMax } = calculateYAxisRange(finalData);

  // Build exactly 6 ticks between yMin and yMax (inclusive)
  const yTicks: number[] = (() => {
    const count = 6;
    const ticks: number[] = [];

    // Edge case: yMin and yMax are equal (or very close due to floating point)
    if (Math.abs(yMax - yMin) < Number.EPSILON) {
      for (let i = 0; i < count; i++) ticks.push(yMin);
      return ticks;
    }

    // Edge case: yMin > yMax (shouldn't happen, but handle it)
    if (yMin > yMax) {
      // Reverse the range
      const step = (yMin - yMax) / (count - 1);
      for (let i = 0; i < count; i++) {
        ticks.push(yMax + i * step);
      }
      return ticks.reverse();
    }

    // Normal case: calculate evenly spaced ticks
    const step = (yMax - yMin) / (count - 1);
    for (let i = 0; i < count; i++) {
      // Use toFixed and parseFloat to handle floating point precision issues
      const tickValue = yMin + i * step;
      // Round to reasonable precision (10 decimal places max)
      ticks.push(parseFloat(tickValue.toFixed(10)));
    }

    // Ensure the last tick is exactly yMax to avoid floating point drift
    ticks[count - 1] = yMax;

    return ticks;
  })();

  const series: LineChartSeries[] = [
    {
      id: 'riskScore',
      label: 'Risk score',
      data: finalData.map(point => ({
        x: point.date,
        y: point.riskScore,
      })),
      color: lineColor, // Dynamic color based on percentage change
    },
  ];

  const customHeader = (
    <HeaderContainer>
      <TitleContainer>
        <StyledTitle>{title}</StyledTitle>
      </TitleContainer>
      <PercentageContainer
        backgroundColor={indicatorColor}
        textColor={indicatorTextColor}
      >
        <TrendIcon sx={{ fontSize: '16px', color: indicatorTextColor }} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: indicatorTextColor }}
        >
          {calculatedPercentageChange > 0 ? '+' : ''}
          {calculatedPercentageChange.toFixed(1)}%
        </Typography>
      </PercentageContainer>
    </HeaderContainer>
  );

  return (
    <ChartBox
      title={title}
      tooltip={tooltip}
      width={width}
      customHeader={customHeader}
    >
      <LineChart
        series={series}
        width="100%"
        height={300}
        showLegend
        legendPosition="bottom"
        showGrid
        formatYValue={formatRiskScore}
        formatXValue={formatXAxisDate}
        formatTooltipXValue={formatTooltipDate}
        showDataPoints={false}
        customXSort={values => sortDateStrings(values as string[])}
        yAxisMin={yMin}
        yAxisMax={yMax}
        yAxisTicks={yTicks}
      />
    </ChartBox>
  );
};

export default RiskOverTimeTile;
