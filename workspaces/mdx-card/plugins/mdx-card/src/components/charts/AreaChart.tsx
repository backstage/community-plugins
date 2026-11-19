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
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useChartPalette } from './useChartPalette';

/**
 * Props for {@link AreaChart}.
 *
 * @public
 */
export interface AreaChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
  height?: number;
  width?: string | number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  curved?: boolean;
  stacked?: boolean;
}

/**
 * Chart component available to MDX templates.
 *
 * @public
 */
export function AreaChart({
  data,
  xKey,
  yKeys,
  height = 300,
  width = '100%',
  colors,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  curved = true,
  stacked = false,
}: AreaChartProps) {
  const getColor = useChartPalette(colors);

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type={curved ? 'monotone' : 'linear'}
            dataKey={key}
            fill={getColor(index)}
            stroke={getColor(index)}
            fillOpacity={0.3}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
