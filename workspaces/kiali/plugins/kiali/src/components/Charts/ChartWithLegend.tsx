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
  XAxisType,
} from '@backstage-community/plugin-kiali-common/types';
import { useTheme } from '@material-ui/core/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { default as React } from 'react';

export const MIN_HEIGHT = 20;
export const MIN_HEIGHT_YAXIS = 70;
export const MIN_WIDTH = 275;
export const LEGEND_HEIGHT = 25;

type Props<T extends RichDataPoint> = {
  chartHeight?: number;
  data: VCLines<T & VCDataPoint>;
  // Kept for API compatibility with the old implementation; ignored now.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seriesComponent: React.ReactElement<any>;
  // Additional legacy props kept so call sites compile; ignored by this simplified renderer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moreChartProps?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (datum: any) => void;
  isMaximized?: boolean;
  timeWindow?: [Date, Date];
  unit: string;
  xAxis?: XAxisType;
};

/**
 * Minimal replacement for the previous PatternFly/Victory-based ChartWithLegend.
 * We intentionally drop advanced features (legend toggles, spans, overlays, brush/zoom, custom tooltips, trendlines).
 */
export const ChartWithLegend = <T extends RichDataPoint>(props: Props<T>) => {
  const [width, setWidth] = React.useState<number>(MIN_WIDTH);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth || MIN_WIDTH);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const height = props.chartHeight ?? 300;
  const xData = (props.data[0]?.datapoints ?? []).map((_, idx) => idx);
  const series = props.data.map(s => ({
    data: s.datapoints.map(dp => dp.y),
    label: s.legendItem.name,
    color: s.color ?? s.legendItem.symbol.fill,
  }));

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <LineChart
        aria-label="Kiali chart"
        width={width}
        height={height}
        xAxis={[{ data: xData }]}
        series={series}
        slotProps={{ legend: { hidden: true } }}
        sx={{
          '& .MuiChartsAxis-tickLabel': {
            fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000',
          },
          '& .MuiChartsAxis-label': {
            fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000',
          },
        }}
      />
    </div>
  );
};
