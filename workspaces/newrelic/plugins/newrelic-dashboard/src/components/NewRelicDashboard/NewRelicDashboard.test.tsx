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
import { Entity } from '@backstage/catalog-model';
import { storageApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { screen, waitFor } from '@testing-library/react';
import { newRelicDashboardApiRef } from '../../api';
import { NEWRELIC_GUID_ANNOTATION } from '../../constants';
import { NewRelicDashboard } from './NewRelicDashboard';

const pagesByGuid: Record<string, string> = {
  'guid-a': 'Infrastructure overview',
  'guid-b': 'Business metrics',
};

const getDashboardEntity = jest.fn(async (guid: string) => ({
  getDashboardEntity: {
    data: {
      actor: {
        entitySearch: {
          results: {
            entities: [
              {
                dashboardParentGuid: guid,
                guid: `${guid}-page`,
                permalink: `https://one.newrelic.com/${guid}`,
                name: pagesByGuid[guid],
              },
            ],
          },
        },
      },
    },
  },
}));

const getDashboardSnapshot = jest.fn(async () => ({
  getDashboardSnapshot: {
    data: { dashboardCreateSnapshotUrl: 'https://example.com/snapshot.pdf' },
  },
}));

const renderDashboard = (annotation: string) => {
  const entity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
      annotations: { [NEWRELIC_GUID_ANNOTATION]: annotation },
    },
  };
  return renderInTestApp(
    <TestApiProvider
      apis={[
        [newRelicDashboardApiRef, { getDashboardEntity, getDashboardSnapshot }],
        [storageApiRef, mockApis.storage()],
      ]}
    >
      <EntityProvider entity={entity}>
        <NewRelicDashboard />
      </EntityProvider>
    </TestApiProvider>,
  );
};

describe('NewRelicDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the pages and snapshots of a single dashboard', async () => {
    await renderDashboard('guid-a');

    expect(
      await screen.findByRole('tab', { name: 'Infrastructure overview' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tablist')).toHaveLength(1);
    await waitFor(() =>
      expect(getDashboardSnapshot).toHaveBeenCalledWith(
        'guid-a-page',
        expect.any(Number),
      ),
    );
  });

  it('shows the pages and snapshots of every dashboard', async () => {
    await renderDashboard('guid-a, guid-b');

    expect(
      await screen.findByRole('tab', { name: 'Infrastructure overview' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('tab', { name: 'Business metrics' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tablist')).toHaveLength(2);
    expect(screen.getAllByText('New Relic Dashboard Pages')).toHaveLength(2);
    await waitFor(() => {
      expect(getDashboardSnapshot).toHaveBeenCalledWith(
        'guid-a-page',
        expect.any(Number),
      );
      expect(getDashboardSnapshot).toHaveBeenCalledWith(
        'guid-b-page',
        expect.any(Number),
      );
    });
  });
});
