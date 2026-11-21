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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { newRelicDashboardApiRef } from '../../api';
import { NEWRELIC_GUID_ANNOTATION } from '../../constants';
import { DashboardEntityList } from './DashboardEntityList';

const pagesByGuid: Record<string, string> = {
  'guid-a': 'Infrastructure overview',
  'guid-b': 'Business metrics',
};

const getDashboardEntity = jest.fn(async (guid: string) => {
  if (guid === 'guid-broken') {
    throw new Error('Request failed');
  }
  return {
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
  };
});

const renderList = (annotation?: string) => {
  const entity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
      annotations:
        annotation === undefined
          ? {}
          : { [NEWRELIC_GUID_ANNOTATION]: annotation },
    },
  };
  return renderInTestApp(
    <TestApiProvider
      apis={[
        [
          newRelicDashboardApiRef,
          { getDashboardEntity, getDashboardSnapshot: jest.fn() },
        ],
      ]}
    >
      <EntityProvider entity={entity}>
        <DashboardEntityList />
      </EntityProvider>
    </TestApiProvider>,
  );
};

describe('DashboardEntityList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the pages of a single dashboard', async () => {
    await renderList('guid-a');

    expect(
      await screen.findByText('Infrastructure overview'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('New Relic Dashboard Pages')).toHaveLength(1);
    expect(getDashboardEntity).toHaveBeenCalledTimes(1);
    expect(getDashboardEntity).toHaveBeenCalledWith('guid-a');
  });

  it('shows one section per dashboard, in annotation order', async () => {
    await renderList(' guid-a , guid-b, guid-a,');

    expect(await screen.findByText('Business metrics')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure overview')).toBeInTheDocument();
    expect(screen.getAllByText('New Relic Dashboard Pages')).toHaveLength(2);
    expect(getDashboardEntity.mock.calls).toEqual([['guid-a'], ['guid-b']]);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://one.newrelic.com/guid-a');
    expect(links[1]).toHaveAttribute('href', 'https://one.newrelic.com/guid-b');
  });

  it('keeps showing the other dashboards when one request fails', async () => {
    await renderList('guid-broken, guid-b');

    expect(await screen.findByText('Business metrics')).toBeInTheDocument();
    expect(screen.getByText('Request failed')).toBeInTheDocument();
    expect(getDashboardEntity.mock.calls).toEqual([
      ['guid-broken'],
      ['guid-b'],
    ]);
  });

  it('shows the missing annotation state when there are no GUIDs', async () => {
    await renderList(' , ');

    expect(screen.getByText(/Missing Annotation/i)).toBeInTheDocument();
    expect(getDashboardEntity).not.toHaveBeenCalled();
  });
});
