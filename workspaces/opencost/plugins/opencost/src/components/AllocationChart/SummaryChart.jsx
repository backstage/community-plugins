/*
 * Copyright 2023 The Backstage Authors
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
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { primary, greyscale, browns } from '../../constants/colors';
import { toCurrency } from '../../util';

function toPieData(top, other, idle) {
  const slices = [];

  for (const i in top) {
    if (Object.hasOwn(top, i)) {
      const allocation = top[i];
      const fill =
        allocation.name === '__unallocated__'
          ? '#212121'
          : primary[i % primary.length];

      slices.push({
        name: allocation.name,
        value: allocation.totalCost,
        fill: fill,
      });
    }
  }

  for (const i in other) {
    if (Object.hasOwn(other, i)) {
      const allocation = other[i];
      const fill = browns[i % browns.length];
      slices.push({
        name: allocation.name,
        value: allocation.totalCost,
        fill: fill,
      });
    }
  }

  for (const i in idle) {
    if (Object.hasOwn(idle, i)) {
      const allocation = idle[i];
      const fill = greyscale[i % greyscale.length];
      slices.push({
        name: allocation.name,
        value: allocation.totalCost,
        fill: fill,
      });
    }
  }

  return slices;
}

const SummaryChart = ({ top, other, idle, currency, height }) => {
  const pieData = toPieData(top, other, idle);

  const renderLabel = params => {
    const { cx, cy, midAngle, outerRadius, percent, name, fill, value } =
      params;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    x += x > cx ? 2 : -2;
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    // y -= Math.min(Math.abs(2 / Math.cos(-midAngle * RADIAN)), 8)

    if (percent < 0.02) {
      return undefined;
    }

    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name}: ${toCurrency(value, currency)} (${(percent * 100).toFixed(
          1,
        )}%)`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          label={renderLabel}
          labelLine
          // niko: if tooltips error, try disabling animation
          // isAnimationActive={false}
          animationDuration={400}
          cy="90%"
          outerRadius="140%"
          innerRadius="60%"
          startAngle={180}
          endAngle={0}
        >
          {pieData.map((datum, i) => (
            <Cell key={i} fill={datum.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SummaryChart;
