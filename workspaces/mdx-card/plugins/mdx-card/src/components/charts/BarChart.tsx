/*
 * Copyright 2026 The Backstage Authors
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
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartPalette } from './chartPalette';

/**
 * Props for {@link BarChart}.
 *
 * @public
 */
export interface BarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
  height?: number;
  width?: string | number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
}

/**
 * Chart component available to MDX templates.
 *
 * @public
 */
export function BarChart({
  data,
  xKey,
  yKeys,
  height = 300,
  width = '100%',
  colors,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false,
  horizontal = false,
}: BarChartProps) {
  const getColor = chartPalette(colors);

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {horizontal ? (
          <>
            <XAxis type="number" />
            <YAxis dataKey={xKey} type="category" />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} />
            <YAxis />
          </>
        )}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getColor(index)}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
