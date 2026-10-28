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

import { render, screen } from '@testing-library/react';
import {
  V2CustomizationMetricRow,
  V2CustomizationSummaryRow,
} from '@backstage-community/plugin-copilot-common';
import { CustomizationMetrics } from './CustomizationMetrics';

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

jest.mock('@backstage/ui', () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Item: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

const BASE_METRIC: V2CustomizationMetricRow = {
  day: '2026-10-22',
  metrics_type: 'organization',
  entity_id: 'org-1',
  scope: 'aggregate',
  team_slug: '',
  user_id: 0,
  user_login: '',
  category: 'skill',
  item_name: 'release-checks',
  interaction_count: 2,
};

const BASE_SUMMARY: V2CustomizationSummaryRow = {
  day: '2026-10-22',
  metrics_type: 'organization',
  entity_id: 'org-1',
  scope: 'aggregate',
  team_slug: '',
  user_id: 0,
  user_login: '',
  category: 'skill',
  distinct_item_count: 1,
};

describe('CustomizationMetrics', () => {
  it('groups item usage by category and selects the latest summary', () => {
    render(
      <CustomizationMetrics
        metrics={[
          BASE_METRIC,
          {
            ...BASE_METRIC,
            day: '2026-10-23',
            interaction_count: 3,
          },
          {
            ...BASE_METRIC,
            category: 'mcp',
            interaction_count: 4,
          },
        ]}
        summaries={[
          {
            ...BASE_SUMMARY,
            day: '2026-10-23',
            distinct_item_count: 3,
          },
          BASE_SUMMARY,
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Skill' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Mcp' })).toBeVisible();
    expect(screen.getByText('release-checks: 5')).toBeVisible();
    expect(screen.getByText('release-checks: 4')).toBeVisible();
    expect(screen.getByText('3 distinct items on 2026-10-23')).toBeVisible();
  });

  it('renders safely when summaries or metrics are unavailable', () => {
    const { rerender } = render(
      <CustomizationMetrics metrics={[BASE_METRIC]} summaries={[]} />,
    );

    expect(screen.queryByText(/distinct items on/)).not.toBeInTheDocument();

    rerender(<CustomizationMetrics metrics={[]} summaries={[]} />);

    expect(
      screen.getByText(
        'No customization usage was recorded for this date range.',
      ),
    ).toBeVisible();
  });
});
