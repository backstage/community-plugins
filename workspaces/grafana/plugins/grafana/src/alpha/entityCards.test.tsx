import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { sampleEntity } from '../__fixtures__/entity';
import * as cards from './entityCards';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { GrafanaApi, grafanaApiRef } from '../api';
import { GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD } from '../constants';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

describe('Entity card extensions', () => {
  const mockGrafanaApi = createApiExtension({
    factory: createApiFactory({
      api: grafanaApiRef,
      deps: {},
      factory: () =>
        ({
          listDashboards: async () => [],
          alertsForSelector: async () => [],
        } as unknown as GrafanaApi),
    }),
  });

  it('should render the Alerts card', async () => {
    expect(true).toBe(true);
    createExtensionTester(cards.entityGrafanaAlertsCard)
      .add(mockGrafanaApi)
      .render();
    await waitFor(
      () => expect(screen.getByText('Alerts')).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('should render the Dashboards card', async () => {
    createExtensionTester(cards.entityGrafanaDashboardsCard)
      .add(mockGrafanaApi)
      .render();
    await waitFor(
      () => expect(screen.getByText('Dashboards')).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it('should render the Overview Dashboard card', async () => {
    createExtensionTester(cards.entityGrafanaOverviewDashboardViewer)
      .add(mockGrafanaApi)
      .render();

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
