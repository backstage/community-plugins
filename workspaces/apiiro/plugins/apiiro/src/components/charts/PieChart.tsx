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
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';
import { useState, useMemo, useEffect, useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FONT_FAMILY } from '../../theme/fonts';
import { languageIconMap, LanguageKey } from '../common/languageIcons';
import { getBlueColorVariants } from '../../theme/themeUtils';

const PIE_CHART_MAX_ITEMS_LIMIT = 5;
export interface PieChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: {
    primary: string;
    secondary: string;
  };
  generateColor?: (index: number, itemId: string) => string;
  onDataProcessed?: (processedData: PieChartData[]) => void;
}

const ChartContainer = styled('div')(() => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
}));

const CenterLabelContainer = styled('div')(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  pointerEvents: 'none',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const PrimaryLabel = styled('div')(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 600,
  fontFamily: FONT_FAMILY,
  color: theme.palette.text.primary,
  lineHeight: '1.2',
}));

const SecondaryLabel = styled('div')(({ theme }) => ({
  fontSize: '12px',
  fontFamily: FONT_FAMILY,
  color: theme.palette.text.secondary,
  marginTop: '4px',
}));

const TertiaryLabel = styled('div')(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: FONT_FAMILY,
  color: theme.palette.text.primary,
  marginTop: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
}));

export const PieChart = ({
  data,
  width = 300,
  height = 300,
  innerRadius: innerRadiusProp,
  outerRadius: outerRadiusProp,
  centerLabel,
  generateColor,
  onDataProcessed,
}: PieChartProps) => {
  const theme = useTheme();
  const blueColorVariants = getBlueColorVariants(theme);
  const defaultColor = blueColorVariants[0];

  // Sort data by value in descending order and generate colors
  const dataWithColors = useMemo(() => {
    // Calculate the sum of all percentage values
    const totalPercentage = data.reduce((sum, item) => sum + item.value, 0);

    // Sort data by value in descending order first
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // Limit to MAX_ITEMS_LIMIT items and combine the rest into "Other"
    let processedData: PieChartData[];
    let otherValue = 0;

    if (sortedData.length > PIE_CHART_MAX_ITEMS_LIMIT) {
      // Take the first PIE_CHART_MAX_ITEMS_LIMIT items
      processedData = sortedData.slice(0, PIE_CHART_MAX_ITEMS_LIMIT);

      // Calculate the sum of remaining items for "Other"
      const remainingItems = sortedData.slice(PIE_CHART_MAX_ITEMS_LIMIT);
      otherValue = remainingItems.reduce((sum, item) => sum + item.value, 0);
    } else {
      processedData = sortedData;
    }

    // Add "Other" item if we have remaining items or if total is less than 100
    if (otherValue > 0 || totalPercentage < 100) {
      const finalOtherValue =
        totalPercentage > 0 ? otherValue + (100 - totalPercentage) : 0;
      const otherItem: PieChartData = {
        id: 'other',
        label: 'Other',
        value: finalOtherValue,
      };

      // Add the "Other" item to the end of the array
      processedData.push(otherItem);
    }

    // Sort data by value in descending order, but keep "Other" always at the end
    const finalSortedData = processedData.sort((a, b) => {
      // If one item is "Other", it should always come last
      if (a.id === 'other' && b.id !== 'other') return 1;
      if (b.id === 'other' && a.id !== 'other') return -1;
      // For all other items, sort by value in descending order
      return b.value - a.value;
    });

    return finalSortedData.map((item, index) => ({
      ...item,
      color:
        item.color ||
        (generateColor ? generateColor(index, item.id) : defaultColor),
      isMaxItem: index === 0, // First item after sorting is the max item
    }));
  }, [data, generateColor, defaultColor]);

  // Calculate dimensions using the same formula
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerWidth =
    (typeof width === 'number' ? width : 300) - margin.left - margin.right;
  const innerHeight =
    (typeof height === 'number' ? height : 300) - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2.2;

  // Calculate responsive radii with fixed donut thickness
  const donutThickness = 24;
  const calculatedOuterRadius = radius * 0.8; // 80% of available radius
  const calculatedInnerRadius = calculatedOuterRadius - donutThickness; // Fixed thickness of 24px

  // Use calculated values or fallback to props
  const outerRadius = outerRadiusProp || calculatedOuterRadius;
  const innerRadius = innerRadiusProp || calculatedInnerRadius;

  // The max item is now the first item after sorting
  const maxItem = dataWithColors[0];

  // Initialize with the max item highlighted by default
  const [hoveredItem, setHoveredItem] = useState<PieChartData | null>(maxItem);
  const chartRef = useRef<any>(null);

  // The max item is always at index 0 after sorting
  const maxItemIndex = 0;

  // Use effect to highlight the max item on mount
  useEffect(() => {
    if (chartRef.current && maxItemIndex >= 0) {
      // Small delay to ensure chart is fully rendered
      const timer = setTimeout(() => {
        setHoveredItem(maxItem);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [maxItem, maxItemIndex]);

  // Notify parent component of processed data
  useEffect(() => {
    if (onDataProcessed) {
      onDataProcessed(dataWithColors);
    }
  }, [dataWithColors, onDataProcessed]);

  const displayItem = hoveredItem || maxItem;
  const displayLabel = centerLabel || {
    primary: `${Math.round(displayItem.value)}%`,
    secondary: 'Repository usage',
  };

  // Use data with generated colors
  const chartData = dataWithColors;

  const handleItemClick = (_event: any, itemIdentifier: any) => {
    if (itemIdentifier?.dataIndex !== undefined) {
      const clickedItem = dataWithColors[itemIdentifier.dataIndex];
      setHoveredItem(clickedItem);
    }
  };

  // Get the correct icon URL for the language, no icon for 'Other'
  const LanguageIcon =
    languageIconMap[displayItem.label as LanguageKey] ||
    languageIconMap['Unknown' as LanguageKey];

  return (
    <ChartContainer>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <MuiPieChart
          ref={chartRef}
          series={[
            {
              data: chartData,
              innerRadius,
              outerRadius,
              paddingAngle: 2,
              cornerRadius: 0,
              highlightScope: { highlighted: 'item' },
              highlighted: {
                additionalRadius: 10,
                innerRadius: innerRadius + 10,
              },
              arcLabel: () => '',
              arcLabelMinAngle: 360,
            },
          ]}
          width={width}
          height={outerRadius * 2 + 50}
          onItemClick={handleItemClick}
          onHighlightChange={highlightedItem => {
            if (highlightedItem?.dataIndex !== undefined) {
              const hoveredData = dataWithColors[highlightedItem.dataIndex];
              setHoveredItem(hoveredData);
            } else {
              setHoveredItem(null);
            }
          }}
          tooltip={{ trigger: 'none' }}
          margin={margin}
          sx={{
            '& .MuiPieArc-root': {
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            },
            // Apply expansion to the max item by default
            [`& .MuiPieArc-root:nth-of-type(${maxItemIndex + 1})`]: {
              transform:
                hoveredItem && hoveredItem.id !== maxItem.id
                  ? 'scale(1)'
                  : 'scale(1.1)',
            },
            // Apply expansion to the currently hovered item (if it's not the max item)
            ...(hoveredItem && hoveredItem.id !== maxItem.id
              ? {
                  [`& .MuiPieArc-root:nth-of-type(${
                    dataWithColors.findIndex(
                      item => item.id === hoveredItem.id,
                    ) + 1
                  })`]: {
                    transform: 'scale(1.1)',
                  },
                }
              : {}),
            // Disable CSS hover effects to prevent conflicts
            '& .MuiPieArc-root:hover': {
              transform: 'none',
              filter: 'none',
              cursor: 'default',
            },
            '& .MuiPieArcLabel-root': {
              display: 'none',
            },
            '& .MuiPieChart-root text': {
              display: 'none',
            },
            '& .MuiChartsLegend-root': {
              display: 'none',
            },
          }}
        />

        <CenterLabelContainer>
          <PrimaryLabel>{displayLabel.primary}</PrimaryLabel>
          <SecondaryLabel>{displayLabel.secondary}</SecondaryLabel>
          <TertiaryLabel>
            <LanguageIcon />
            {displayItem.label}
          </TertiaryLabel>
        </CenterLabelContainer>
      </div>
    </ChartContainer>
  );
};

export default PieChart;
