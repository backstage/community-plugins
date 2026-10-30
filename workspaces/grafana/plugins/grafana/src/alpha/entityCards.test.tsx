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
import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { sampleEntity } from '../__fixtures__/entity';
import * as cards from './entityCards';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { GrafanaApi, grafanaApiRef } from '../api';
import { GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD } from '../constants';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

describe('Entity card extensions', () => {
  const mockGrafanaApi: GrafanaApi = {
    listDashboards: async () => [],
    alertsForSelector: async () => [],
    isUnifiedAlerting: () => false,
  };

  it('should render the Alerts card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]] as const}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(cards.entityGrafanaAlertsCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => expect(screen.getByText('Alerts')).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('should render the Dashboards card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]] as const}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            cards.entityGrafanaDashboardsCard,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => expect(screen.getByText('Dashboards')).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('should render the Overview Dashboard card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]] as const}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            cards.entityGrafanaOverviewDashboardViewer,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    const expectedTitle =
      sampleEntity.entity.metadata.annotations[
        GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD
      ];

    await waitFor(
      () => expect(screen.getByTitle(expectedTitle)).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('should pass extension config through to the Alerts card', async () => {
    // Without config the card renders with the component defaults: no State
    // column and the title "Alerts". The config is the only way the New
    // Frontend System has to change either.
    const alert = {
      name: 'CPU high',
      state: 'alerting',
      matchingSelector: 'service=foo',
      url: 'https://grafana.example.com/alerting/1',
    };
    renderInTestApp(
      <TestApiProvider
        apis={
          [
            [
              grafanaApiRef,
              { ...mockGrafanaApi, alertsForSelector: async () => [alert] },
            ],
          ] as const
        }
      >
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(cards.entityGrafanaAlertsCard, {
            config: { title: 'Grafana alerts', showState: true },
          }).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => expect(screen.getByText('Grafana alerts')).toBeInTheDocument(),
      { timeout: 1000 },
    );
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('should pass extension config through to the Dashboards card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]] as const}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(cards.entityGrafanaDashboardsCard, {
            config: { title: 'Grafana dashboards' },
          }).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => expect(screen.getByText('Grafana dashboards')).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });
});
