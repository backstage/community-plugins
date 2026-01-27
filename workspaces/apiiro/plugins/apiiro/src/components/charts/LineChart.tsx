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
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { formatNumberWithSuffix } from '../../utils/numberFormatter';

export interface LineChartDataPoint {
  x: string | number;
  y: number;
}

export type LineChartCurveType =
  | 'linear'
  | 'step'
  | 'natural'
  | 'monotoneX'
  | 'monotoneY'
  | 'catmullRom';

export interface LineChartSeries {
  id: string;
  label: string;
  data: LineChartDataPoint[];
  color: string;
  connectNulls?: boolean;
  curve?: LineChartCurveType;
}

export interface LineChartProps {
  series: LineChartSeries[];
  width?: number | string;
  height?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatYValue?: (value: number) => string;
  formatXValue?: (value: string | number) => string;
  showDataPoints?: boolean;
  customXSort?: (values: (string | number)[]) => (string | number)[];
  // Optional: allows different formatting for tooltip header than x-axis ticks
  formatTooltipXValue?: (value: string | number) => string;
  // Optional: custom y-axis range
  yAxisMin?: number;
  yAxisMax?: number;
  // Optional: explicit y-axis tick values (overrides tickNumber)
  yAxisTicks?: number[];
}

const formatValue = (value: number): string => {
  return formatNumberWithSuffix(value, 1);
};

const CustomLegendContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  maxWidth: '100%',
  padding: '8px',
  boxSizing: 'border-box',
}));

const LegendItem = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}));

const LegendColor = styled(Box)<{ color: string }>(({ color }) => ({
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
  maxWidth: '100px',
  minWidth: '40px',
}));

export const LineChart = ({
  series,
  width = 400,
  height = 300,
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  formatYValue = formatValue,
  formatXValue,
  showDataPoints = false,
  customXSort,
  formatTooltipXValue,
  yAxisMin,
  yAxisMax,
  yAxisTicks,
}: LineChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = rect.width;
        setContainerWidth(newWidth > 0 ? Math.floor(newWidth) - 10 : 400);
      }
    };

    // Initial measurement
    updateWidth();

    // Use ResizeObserver for better accuracy
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const chartWidth = typeof width === 'string' ? containerWidth : width || 400;

  const { chartSeries, xAxisData } = useMemo(() => {
    const allXValues = new Set<string | number>();

    // Collect all unique x values
    series.forEach(s => {
      s.data.forEach(point => {
        allXValues.add(point.x);
      });
    });

    const sortedXValues = customXSort
      ? customXSort(Array.from(allXValues))
      : Array.from(allXValues).sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
          }
          return String(a).localeCompare(String(b));
        });

    const processedSeries = series.map(s => ({
      id: s.id,
      label: s.label,
      data: sortedXValues.map(xVal => {
        const point = s.data.find(p => p.x === xVal);
        return point ? point.y : null;
      }),
      color: s.color,
      connectNulls: false,
      curve: 'linear' as const,
    }));

    return {
      chartSeries: processedSeries,
      xAxisData: sortedXValues,
    };
  }, [series, customXSort]);

  const CustomLegend = () => (
    <CustomLegendContainer>
      {series.map(s => (
        <LegendItem key={s.id}>
          <LegendColor color={s.color} />
          <LegendText>{s.label}</LegendText>
        </LegendItem>
      ))}
    </CustomLegendContainer>
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {showLegend && legendPosition === 'top' && <CustomLegend />}

      <Box sx={{ width: '100%', overflowX: 'auto', minWidth: 0 }}>
        <MuiLineChart
          width={chartWidth}
          height={
            showLegend && legendPosition === 'bottom' ? height - 35 : height
          }
          series={chartSeries}
          legend={{ hidden: true }}
          margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
          xAxis={[
            {
              scaleType: 'point',
              data: xAxisData,
              valueFormatter: formatXValue,
              tickInterval: (_, index) => {
                // Show ticks at indices: 0, 7, 14, 21, 28 (approximately every 7 days, starting from first date)
                return [0, 7, 14, 21, 28].includes(index);
              },
            },
          ]}
          yAxis={[
            {
              valueFormatter: formatYValue,
              tickNumber: yAxisTicks && yAxisTicks.length > 0 ? undefined : 6,
              tickInterval:
                yAxisTicks && yAxisTicks.length > 0 ? yAxisTicks : undefined,
              min: yAxisMin,
              max: yAxisMax,
            },
          ]}
          skipAnimation={false}
          grid={showGrid ? { horizontal: true, vertical: false } : undefined}
          tooltip={
            formatTooltipXValue
              ? {
                  axisContent: (props: any) => {
                    const dataIndex = props?.dataIndex ?? 0;
                    const rawX = xAxisData?.[dataIndex];
                    const header =
                      rawX !== undefined
                        ? formatTooltipXValue(rawX)
                        : props?.label;

                    return (
                      <div className="MuiChartsTooltip-root">
                        <table className="MuiChartsTooltip-table">
                          <tbody>
                            <tr className="MuiChartsTooltip-row">
                              <td className="MuiChartsTooltip-cell" colSpan={2}>
                                {header}
                              </td>
                            </tr>
                            {chartSeries.map((s, idx) => {
                              const value = s.data?.[dataIndex];
                              let formatted: string;
                              if (typeof value === 'number') {
                                formatted = formatYValue(value);
                              } else if (
                                value === null ||
                                value === undefined
                              ) {
                                formatted = '-';
                              } else {
                                formatted = String(value);
                              }
                              return (
                                <tr key={idx} className="MuiChartsTooltip-row">
                                  <td className="MuiChartsTooltip-labelCell">
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
                }
              : undefined
          }
          sx={theme => ({
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
              stroke: theme.palette.divider,
              strokeWidth: 1,
              transform: 'translate(0, -5px)',
            },
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
              transform: 'translate(5px, 0px)',
            },
            '& .MuiChartsGrid-line': {
              strokeDasharray: '3 3',
              stroke: theme.palette.divider,
              strokeWidth: 1,
            },
            '& .MuiLineElement-root': {
              strokeWidth: 2,
            },
            '& .MuiMarkElement-root': {
              r: showDataPoints ? 3 : 0,
              strokeWidth: 2,
              fill: theme.palette.background.paper,
              opacity: showDataPoints ? 1 : 0,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                r: 4,
                opacity: 1,
              },
            },
          })}
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
                    offset: [90, 10],
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
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '0',
                        top: '10%',
                        width: '3px',
                        height: '16px',
                        backgroundColor: theme.palette.primary.main,
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
                      verticalAlign: 'middle',
                    },
                  },
                },
              }),
            },
          }}
        />
      </Box>

      {showLegend && legendPosition === 'bottom' && <CustomLegend />}
    </Box>
  );
};

export default LineChart;
