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
import { render } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { FrictionScoreCard } from './FrictionScoreCard';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { healertApiRef } from '../../api/HealertClient';

// Suppress jsdom @layer CSS parsing errors from @backstage/ui
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(msg => {
    if (
      typeof msg === 'string' &&
      msg.includes('Could not parse CSS stylesheet')
    )
      return;
    console.warn(msg);
  });
});

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'test-service', namespace: 'default' },
  spec: { type: 'service', lifecycle: 'production', owner: 'team' },
};

const mockHealertApi = {
  getFrictionData: jest.fn().mockResolvedValue({
    entityRef: 'component:default/test-service',
    frictionScore: {
      score: 0,
      severity: 'low',
      bypassCount: 0,
      overheadHoursPerEngineer: 0,
      topFrictionWorkflow: null,
      calculatedAt: new Date().toISOString(),
    },
    recentEvents: [],
    sources: { kubernetesAuditLog: true, github: false, jira: false },
  }),
};

describe('FrictionScoreCard', () => {
  it('renders without crashing', () => {
    render(
      <TestApiProvider apis={[[healertApiRef, mockHealertApi]]}>
        <EntityProvider entity={mockEntity}>
          <FrictionScoreCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(document.body).toBeTruthy();
  });
});
