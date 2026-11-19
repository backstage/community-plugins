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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useChartPalette } from './useChartPalette';

/**
 * Props for {@link PieChart}.
 *
 * @public
 */
export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  width?: string | number;
  colors?: string[];
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

/**
 * Chart component available to MDX templates.
 *
 * @public
 */
export function PieChart({
  data,
  height = 300,
  width = '100%',
  colors,
  donut = false,
  showLabels = true,
  showLegend = true,
  showTooltip = true,
}: PieChartProps) {
  const getColor = useChartPalette(colors);

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={donut ? '40%' : 0}
          outerRadius="70%"
          label={showLabels}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
