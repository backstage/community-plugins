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
import React from 'react';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

describe('Entity card extensions', () => {
  const mockGrafanaApi = {
    listDashboards: async () => [],
    alertsForSelector: async () => [],
  } as unknown as GrafanaApi;

  it('should render the Alerts card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]]}>
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
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]]}>
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
      <TestApiProvider apis={[[grafanaApiRef, mockGrafanaApi]]}>
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
});
