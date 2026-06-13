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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';
import { DoraMetric } from '@backstage-community/plugin-devlake-common';

describe('MetricCard', () => {
  const metric: DoraMetric = {
    value: 4.2,
    unit: 'deploys/day',
    level: 'elite',
    trend: 12,
  };

  it('renders the title', async () => {
    await renderInTestApp(
      <MetricCard title="Deployment Frequency" metric={metric} />,
    );
    expect(screen.getByText('Deployment Frequency')).toBeInTheDocument();
  });

  it('renders the value and unit', async () => {
    await renderInTestApp(
      <MetricCard title="Deployment Frequency" metric={metric} />,
    );
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('deploys/day')).toBeInTheDocument();
  });

  it('renders the DORA level badge', async () => {
    await renderInTestApp(
      <MetricCard title="Deployment Frequency" metric={metric} />,
    );
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });

  it('renders the trend percentage', async () => {
    await renderInTestApp(
      <MetricCard title="Deployment Frequency" metric={metric} />,
    );
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('does not render trend when zero', async () => {
    const zeroTrend = { ...metric, trend: 0 };
    await renderInTestApp(
      <MetricCard title="Deployment Frequency" metric={zeroTrend} />,
    );
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
