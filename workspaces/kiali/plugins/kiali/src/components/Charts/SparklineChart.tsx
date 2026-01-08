/*
 * Copyright 2024 The Backstage Authors
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
import type {
  RichDataPoint,
  VCDataPoint,
  VCLines,
} from '@backstage-community/plugin-kiali-common/types';
import { useTheme } from '@material-ui/core/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { default as React } from 'react';

type Props = {
  ariaTitle?: string;
  height?: number;
  labelName: string;
  name: string;
  series: VCLines<RichDataPoint>;
  showLegend?: boolean;
  showXAxisValues?: boolean;
  showYAxis?: boolean;
  tooltipFormat?: (dp: VCDataPoint) => string;
  // Legacy props kept for compatibility; ignored by this simplified implementation.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  padding?: any;
  thresholds?: VCLines<RichDataPoint>;
  width?: number;
};

/**
 * Simplified sparkline chart implementation using MUI X Charts.
 * We intentionally drop advanced Victory/PatternFly features (legend toggles, thresholds, voronoi tooltips, etc.)
 * as part of the migration.
 */
export const SparklineChart = (props: Props) => {
  const [width, setWidth] = React.useState<number>(props.width || 1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    // If width is controlled via props, don't attach resize listeners.
    if (props.width !== undefined) {
      return () => {};
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth || 1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [props.width]);

  const height = props.height ?? 300;
  const xData = (props.series[0]?.datapoints ?? []).map((_, idx) => idx);

  const series = props.series.map(s => ({
    data: s.datapoints.map(dp => dp.y),
    label: s.legendItem.name,
    color: s.color ?? s.legendItem.symbol.fill,
  }));

  const xValueFormatter = (idx: number) => {
    if (!props.showXAxisValues) {
      return '';
    }
    const dp = props.series[0]?.datapoints[idx];
    const x = dp?.x;
    if (x instanceof Date) {
      return x.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${x ?? idx}`;
  };

  const chart = (
    <LineChart
      aria-label={props.ariaTitle ?? props.name}
      width={width}
      height={height}
      series={series}
      xAxis={[
        {
          data: xData,
          valueFormatter: xValueFormatter,
        },
      ]}
      yAxis={props.showYAxis ? [{ label: props.labelName }] : []}
      slotProps={{
        legend: props.showLegend ? undefined : { hidden: true },
      }}
      sx={{
        '& .MuiChartsAxis-tickLabel': {
          fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000',
        },
        '& .MuiChartsAxis-label': {
          fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000',
        },
      }}
    />
  );

  if (props.width === undefined) {
    return <div ref={containerRef}>{chart}</div>;
  }
  return chart;
};
