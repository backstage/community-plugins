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
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useChartPalette } from './useChartPalette';

/**
 * Props for {@link LineChart}.
 *
 * @public
 */
export interface LineChartProps {
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
  showDots?: boolean;
}

/**
 * Chart component available to MDX templates.
 *
 * @public
 */
export function LineChart({
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
  showDots = true,
}: LineChartProps) {
  const getColor = useChartPalette(colors);

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type={curved ? 'monotone' : 'linear'}
            dataKey={key}
            stroke={getColor(index)}
            dot={showDots}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
