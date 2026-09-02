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
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';
import { CodeSmellsRatingCard, HotspotsReviewed } from './MetricInsights';

function createSummary(
  metrics: Partial<FindingSummary['metrics']>,
): FindingSummary {
  return {
    title: 'our:service',
    lastAnalysis: '2020-01-01T00:00:00Z',
    metrics: metrics as FindingSummary['metrics'],
    projectUrl: 'https://sonarcloud.io/dashboard?id=our%3Aservice',
    getIssuesUrl: () => 'https://sonarcloud.io/project/issues?id=our%3Aservice',
    getComponentMeasuresUrl: () =>
      'https://sonarcloud.io/component_measures?id=our%3Aservice',
    getSecurityHotspotsUrl: () =>
      'https://sonarcloud.io/project/security_hotspots?id=our%3Aservice',
  };
}

describe('CodeSmellsRatingCard', () => {
  it('should render the technical debt below the code smell count', async () => {
    await renderInTestApp(
      <CodeSmellsRatingCard
        value={createSummary({
          code_smells: '340',
          sqale_rating: '1.0',
          sqale_index: '2640',
        })}
        title="Code Smells"
      />,
    );

    expect(await screen.findByText('340')).toBeInTheDocument();
    expect(screen.getByText('Debt: 5d 4h')).toBeInTheDocument();
  });

  it('should render nothing extra when the instance does not report the debt', async () => {
    await renderInTestApp(
      <CodeSmellsRatingCard
        value={createSummary({ code_smells: '340', sqale_rating: '1.0' })}
        title="Code Smells"
      />,
    );

    expect(await screen.findByText('340')).toBeInTheDocument();
    expect(screen.queryByText(/Debt:/)).not.toBeInTheDocument();
  });
});

describe('HotspotsReviewed', () => {
  it('should render the hotspot count below the reviewed percentage', async () => {
    await renderInTestApp(
      <HotspotsReviewed
        value={createSummary({
          security_hotspots: '12',
          security_hotspots_reviewed: '78',
          security_review_rating: '2.0',
        })}
        title="Hotspots Reviewed"
      />,
    );

    expect(await screen.findByText('78%')).toBeInTheDocument();
    expect(screen.getByText('Hotspots: 12')).toBeInTheDocument();
  });

  it('should hide the counts in compact mode, where the table columns are narrow', async () => {
    await renderInTestApp(
      <HotspotsReviewed
        value={createSummary({
          security_hotspots: '12',
          security_hotspots_reviewed: '78',
          security_review_rating: '2.0',
        })}
        title="Hotspots Reviewed"
        compact
      />,
    );

    expect(await screen.findByText('78%')).toBeInTheDocument();
    expect(screen.queryByText('Hotspots: 12')).not.toBeInTheDocument();
  });
});
