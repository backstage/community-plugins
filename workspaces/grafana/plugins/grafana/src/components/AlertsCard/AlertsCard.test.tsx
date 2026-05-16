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

import { AlertsTable, AlertsCard } from './AlertsCard';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { GrafanaApi, grafanaApiRef } from '../../api';
import { screen, waitFor } from '@testing-library/react';

describe('AlertsTable', () => {
  it('should render even with no alerts', async () => {
    const rendered = await renderInTestApp(
      <AlertsTable opts={{ title: 'alerts', showState: true }} alerts={[]} />,
    );

    expect(
      await rendered.findByText('No records to display'),
    ).toBeInTheDocument();
  });
});

describe('AlertsCard', () => {
  it('uses per-host isUnifiedAlerting instead of global config', async () => {
    const alertsForSelector = jest.fn().mockResolvedValue([]);
    const isUnifiedAlerting = jest.fn().mockReturnValue(true);

    const mockApi: GrafanaApi = {
      listDashboards: async () => [],
      alertsForSelector,
      isUnifiedAlerting,
    };

    // Entity with host-id and alert-label-selector (unified alerting)
    const entity = {
      apiVersion: 'backstage.io/v1alpha1' as const,
      kind: 'Component',
      metadata: {
        name: 'test-service',
        annotations: {
          'grafana/alert-label-selector': 'service=test-service',
          'grafana/dashboard-selector': 'test-tag',
          'grafana/host-id': 'production',
        },
      },
      spec: { type: 'service', owner: 'team', lifecycle: 'production' },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockApi]]}>
        <EntityProvider entity={entity}>
          <AlertsCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      // isUnifiedAlerting should be called with the entity's host-id
      expect(isUnifiedAlerting).toHaveBeenCalledWith('production');
    });

    await waitFor(() => {
      // Since unified alerting is true, it should use alert-label-selector
      expect(alertsForSelector).toHaveBeenCalledWith(
        'service=test-service',
        'production',
      );
    });
  });

  it('uses dashboard selector when host has legacy alerting', async () => {
    const alertsForSelector = jest.fn().mockResolvedValue([]);
    const isUnifiedAlerting = jest.fn().mockReturnValue(false);

    const mockApi: GrafanaApi = {
      listDashboards: async () => [],
      alertsForSelector,
      isUnifiedAlerting,
    };

    const entity = {
      apiVersion: 'backstage.io/v1alpha1' as const,
      kind: 'Component',
      metadata: {
        name: 'test-service',
        annotations: {
          'grafana/alert-label-selector': 'service=test-service',
          'grafana/dashboard-selector': 'test-tag',
          'grafana/host-id': 'staging',
        },
      },
      spec: { type: 'service', owner: 'team', lifecycle: 'production' },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockApi]]}>
        <EntityProvider entity={entity}>
          <AlertsCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(isUnifiedAlerting).toHaveBeenCalledWith('staging');
    });

    await waitFor(() => {
      // Since unified alerting is false, it should use dashboard-selector
      expect(alertsForSelector).toHaveBeenCalledWith('test-tag', 'staging');
    });
  });

  it('works without host-id annotation (falls back to undefined)', async () => {
    const alertsForSelector = jest.fn().mockResolvedValue([]);
    const isUnifiedAlerting = jest.fn().mockReturnValue(false);

    const mockApi: GrafanaApi = {
      listDashboards: async () => [],
      alertsForSelector,
      isUnifiedAlerting,
    };

    const entity = {
      apiVersion: 'backstage.io/v1alpha1' as const,
      kind: 'Component',
      metadata: {
        name: 'test-service',
        annotations: {
          'grafana/dashboard-selector': 'test-tag',
        },
      },
      spec: { type: 'service', owner: 'team', lifecycle: 'production' },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockApi]]}>
        <EntityProvider entity={entity}>
          <AlertsCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(isUnifiedAlerting).toHaveBeenCalledWith(undefined);
    });

    await waitFor(() => {
      expect(alertsForSelector).toHaveBeenCalledWith('test-tag', undefined);
    });
  });

  it('shows missing annotation when unified host but no alert-label-selector', async () => {
    const mockApi: GrafanaApi = {
      listDashboards: async () => [],
      alertsForSelector: async () => [],
      isUnifiedAlerting: () => true,
    };

    const entity = {
      apiVersion: 'backstage.io/v1alpha1' as const,
      kind: 'Component',
      metadata: {
        name: 'test-service',
        annotations: {
          'grafana/dashboard-selector': 'test-tag',
          // No alert-label-selector, but host uses unified alerting
        },
      },
      spec: { type: 'service', owner: 'team', lifecycle: 'production' },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockApi]]}>
        <EntityProvider entity={entity}>
          <AlertsCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Missing Annotation/i)).toBeInTheDocument();
    });
  });
});
