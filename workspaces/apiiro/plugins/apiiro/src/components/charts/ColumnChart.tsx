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
import { useMemo, useRef, useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { FONT_FAMILY } from '../../theme/fonts';
import { formatNumberWithSuffix } from '../../utils/numberFormatter';

export interface ColumnData {
  category: string;
  values: {
    label: string;
    value: number;
    color: string;
  }[];
}

export interface ColumnChartProps {
  data: ColumnData[];
  width?: number;
  height?: number;
  maxValue?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
}

const formatValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return formatNumberWithSuffix(value, 0);
};

const CustomLegendContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  maxWidth: '100%',
  padding: '4px 8px',
  boxSizing: 'border-box',
}));

const LegendItem = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}));

const LegendLine = styled(Box)<{ color: string }>(({ color }) => ({
  width: '16px',
  height: '3px',
  backgroundColor: color,
  borderRadius: '1px',
  flexShrink: 0,
}));

const LegendText = styled('p')(({ theme }) => ({
  fontSize: '11px',
  color: theme.palette.text.secondary,
  fontWeight: 400,
  lineHeight: 1.2,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
  minWidth: '40px',
}));

export const ColumnChart = ({
  data,
  width = 400,
  height = 300,
  maxValue,
  showLegend = true,
  legendPosition = 'bottom',
}: ColumnChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width);

  // Track container width changes
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width || width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width]);
  // Calculate responsive dimensions based on container width
  const { xAxisData, series, colors, responsiveConfig } = useMemo(() => {
    const categories = data.map(item => item.category);
    const allLabels = Array.from(
      new Set(data.flatMap(item => item.values.map(v => v.label))),
    );

    const chartSeries = allLabels.map(label => {
      const seriesData = data.map(item => {
        const value = item.values.find(v => v.label === label);
        return value ? value.value : 0;
      });

      const color =
        data.flatMap(item => item.values).find(value => value.label === label)
          ?.color || '#ccc';

      return {
        data: seriesData,
        label,
        id: label,
        color,
        valueFormatter: (v: number | null) =>
          v !== null ? formatValue(v) : '',
      };
    });

    const seriesColors = allLabels.map(label => {
      return (
        data.flatMap(item => item.values).find(value => value.label === label)
          ?.color || '#ccc'
      );
    });

    // Calculate responsive configuration
    const numCategories = categories.length;
    const numSeries = allLabels.length;
    const actualWidth =
      typeof containerWidth === 'number' ? containerWidth : width;
    const availableWidth = actualWidth - 80; // Reserve space for Y-axis labels and padding

    // Improved responsive calculation
    const totalBarsPerCategory = numSeries;

    // Define responsive breakpoints
    const isSmall = availableWidth < 300;
    const isMedium = availableWidth >= 300 && availableWidth < 450;

    // Adjust parameters based on container size
    let minColumnWidth;
    let maxColumnWidth;
    let categoryGap;
    let transformScale;

    if (isSmall) {
      // Small containers: prioritize fitting everything
      minColumnWidth = 6;
      maxColumnWidth = 12;
      categoryGap = Math.max(15, availableWidth * 0.08);
      transformScale = 0.2;
    } else if (isMedium) {
      // Medium containers: balanced approach
      minColumnWidth = 8;
      maxColumnWidth = 16;
      categoryGap = Math.max(20, availableWidth * 0.1);
      transformScale = 0.25;
    } else {
      // Large containers: optimal spacing
      minColumnWidth = 10;
      maxColumnWidth = 20;
      categoryGap = Math.max(25, availableWidth * 0.12);
      transformScale = 0.3;
    }

    // Calculate space distribution
    const totalCategoryGaps = (numCategories - 1) * categoryGap;
    const remainingWidth = availableWidth - totalCategoryGaps;
    const widthPerCategory = remainingWidth / numCategories;

    // Ensure minimum spacing between bars in same category
    const barGapInCategory = Math.max(2, widthPerCategory * 0.05);
    const totalBarGapsInCategory =
      (totalBarsPerCategory - 1) * barGapInCategory;
    const availableWidthForBars = widthPerCategory - totalBarGapsInCategory;
    const calculatedBarWidth = availableWidthForBars / totalBarsPerCategory;

    // Apply constraints
    const finalColumnWidth = Math.max(
      minColumnWidth,
      Math.min(calculatedBarWidth, maxColumnWidth),
    );

    // Adjust transform scale based on final calculations
    if (calculatedBarWidth < minColumnWidth) {
      transformScale = Math.max(0.15, transformScale * 0.8);
    }

    // Calculate responsive margins
    const leftMargin = isSmall ? 35 : 40;
    const rightMargin = isSmall
      ? 5
      : Math.max(10, (actualWidth - availableWidth - leftMargin) / 2);

    return {
      xAxisData: categories,
      series: chartSeries,
      colors: seriesColors,
      responsiveConfig: {
        columnWidth: finalColumnWidth,
        transformScale: Math.max(0.15, Math.min(transformScale, 0.4)),
        leftMargin,
        rightMargin,
      },
    };
  }, [data, width, containerWidth]);

  const yAxisMax = useMemo(() => {
    if (maxValue) return maxValue;

    const allValues = data.flatMap(item => item.values.map(v => v.value));
    const max = Math.max(...allValues);

    // Add modest padding (15%) to ensure there's space above the highest bar
    const paddedMax = max * 1.15;

    // Find a nice round number that's close to the padded max
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)) - 1);
    const roundedMax = Math.ceil(paddedMax / magnitude) * magnitude;

    // Ensure minimum padding - if rounded value is too close to max, add one more step
    if (roundedMax - max < max * 0.1) {
      return roundedMax + magnitude;
    }

    return roundedMax;
  }, [data, maxValue]);

  // Calculate custom Y-axis tick values
  const yTickValues = useMemo(() => {
    const yMax = yAxisMax;
    return [0, yMax / 3, (2 * yMax) / 3, yMax].map(
      num => Math.ceil(num / 10) * 10,
    );
  }, [yAxisMax]);

  // Get unique labels for custom legend
  const legendItems = useMemo(() => {
    const labelSet = new Set<string>();
    const items: { label: string; color: string }[] = [];

    data.forEach(item => {
      item.values.forEach(value => {
        if (!labelSet.has(value.label)) {
          labelSet.add(value.label);
          items.push({ label: value.label, color: value.color });
        }
      });
    });

    return items;
  }, [data]);

  // Create responsive legend based on container width
  const customLegend = showLegend && (
    <CustomLegendContainer>
      {legendItems.map(item => {
        return (
          <LegendItem key={item.label}>
            <LegendLine color={item.color} />
            <LegendText title={item.label}>{item.label}</LegendText>
          </LegendItem>
        );
      })}
    </CustomLegendContainer>
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {legendPosition === 'top' && customLegend}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <BarChart
          width={typeof containerWidth === 'number' ? containerWidth : width}
          height={
            showLegend && legendPosition === 'bottom' ? height - 35 : height
          }
          series={series.map(s => ({
            ...s,
            valueFormatter: formatValue,
          }))}
          xAxis={[
            {
              data: xAxisData,
              scaleType: 'band',
              disableLine: true,
              disableTicks: true,
            },
          ]}
          yAxis={[
            {
              max: yAxisMax,
              tickNumber: yTickValues.length,
              data: yTickValues,
              valueFormatter: formatValue,
              disableLine: true,
              disableTicks: true,
            },
          ]}
          margin={{
            left: responsiveConfig.leftMargin,
            right: responsiveConfig.rightMargin,
            top: 10,
            bottom: 35,
          }}
          skipAnimation={false}
          colors={colors}
          legend={{ hidden: true }}
          grid={{ horizontal: true, vertical: false }}
          sx={theme => ({
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translate(-10px, 0)',
            },
            [`.${axisClasses.bottom} .${axisClasses.label}`]: {
              fontSize: '12px',
            },
            [`.${axisClasses.left} .${axisClasses.line}`]: {
              display: 'none',
            },
            [`.${axisClasses.bottom} .${axisClasses.line}`]: {
              display: 'none',
            },
            [`.${axisClasses.left} .${axisClasses.tick}`]: {
              display: 'none',
            },
            [`.${axisClasses.bottom} .${axisClasses.tick}`]: {
              display: 'none',
            },
            '& .MuiChartsGrid-line': {
              strokeDasharray: '3 3',
              stroke: theme.palette.divider,
              strokeWidth: 1,
            },
            '& .MuiBarElement-root': {
              transformOrigin: 'center bottom',
              transform: `scaleX(${responsiveConfig.transformScale})`,
            },
          })}
          tooltip={{
            axisContent: (props: any) => {
              const dataIndex = props?.dataIndex ?? 0;
              const header = xAxisData[dataIndex] || props?.label;

              return (
                <div className="MuiChartsTooltip-root">
                  <table className="MuiChartsTooltip-table">
                    <tbody>
                      <tr className="MuiChartsTooltip-row">
                        <td className="MuiChartsTooltip-cell" colSpan={2}>
                          {header}
                        </td>
                      </tr>
                      {series.map((s, idx) => {
                        const value = s.data?.[dataIndex];
                        let formatted: string;
                        if (typeof value === 'number') {
                          formatted = formatValue(value);
                        } else if (value === null || value === undefined) {
                          formatted = '0';
                        } else {
                          formatted = String(value);
                        }
                        return (
                          <tr key={idx} className="MuiChartsTooltip-row">
                            <td
                              className="MuiChartsTooltip-labelCell"
                              style={
                                {
                                  '--series-color': s.color,
                                } as React.CSSProperties
                              }
                            >
                              {s.label}
                            </td>
                            <td className="MuiChartsTooltip-valueCell">
                              {formatted}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            },
          }}
          slotProps={{
            popper: {
              placement: 'auto',
              modifiers: [
                {
                  name: 'flip',
                  enabled: true,
                  options: {
                    fallbackPlacements: ['top', 'bottom', 'right', 'left'],
                    allowedAutoPlacements: ['top', 'bottom'],
                  },
                },
                {
                  name: 'preventOverflow',
                  enabled: true,
                  options: {
                    boundary: 'clippingParents',
                    padding: 8,
                  },
                },
                {
                  name: 'offset',
                  enabled: true,
                  options: {
                    offset: [-100, 10],
                  },
                },
                {
                  name: 'arrow',
                  enabled: false,
                },
              ],
              sx: theme => ({
                '& .MuiChartsTooltip-root': {
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '12px',
                  filter:
                    theme.palette.mode === 'dark'
                      ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                      : 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
                  padding: '12px 16px',
                  minWidth: '140px',
                  fontSize: '12px',
                  fontFamily: FONT_FAMILY,
                },
                '& .MuiChartsTooltip-table': {
                  margin: 0,
                  borderSpacing: 0,
                  width: '100%',
                },
                '& .MuiChartsTooltip-row': {
                  '&:first-of-type': {
                    '& .MuiChartsTooltip-cell': {
                      fontSize: '16px',
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      paddingBottom: '16px',
                      borderBottom: 'none',
                      fontFamily: FONT_FAMILY,
                    },
                  },
                  '&:not(:first-of-type)': {
                    '& .MuiChartsTooltip-cell': {
                      padding: '4px 0',
                      borderBottom: 'none',
                    },
                    '& .MuiChartsTooltip-labelCell': {
                      position: 'relative',
                      paddingLeft: '16px',
                      paddingRight: '4px',
                      paddingBottom: '8px',
                      fontSize: '14px',
                      color: theme.palette.text.secondary,
                      fontFamily: FONT_FAMILY,
                      verticalAlign: 'middle',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '0',
                        top: '10%',
                        width: '3px',
                        height: '16px',
                        backgroundColor: 'var(--series-color)',
                        borderRadius: '2px',
                      },
                    },
                    '& .MuiChartsTooltip-valueCell': {
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      textAlign: 'right',
                      paddingLeft: '4px',
                      paddingBottom: '8px',
                      fontFamily: FONT_FAMILY,
                      verticalAlign: 'middle',
                    },
                  },
                },
              }),
            },
          }}
        />
      </Box>

      {legendPosition === 'bottom' && customLegend}
    </Box>
  );
};

export default ColumnChart;
