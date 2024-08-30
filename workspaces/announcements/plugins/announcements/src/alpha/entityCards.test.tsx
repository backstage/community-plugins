import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { entityAnnouncementsCard } from './entityCards';
import { screen, waitFor } from '@testing-library/react';
import {
  AnnouncementsApi,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import { DateTime } from 'luxon';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import React from 'react';

jest.mock('@backstage/core-plugin-api', () => {
  return {
    ...jest.requireActual('@backstage/core-plugin-api'),
    useRouteRef: () => () => '/mock-route',
  };
});

jest.mock('@backstage/plugin-permission-react', () => {
  return {
    ...jest.requireActual('@backstage/plugin-permission-react'),
    usePermission: () => ({ loading: false, allowed: true }),
  };
});

describe('Entity card extensions', () => {
  const mockAnnouncementsApi = {
    lastSeenDate: () => DateTime.now(),
    announcements: async () => ({
      count: 1,
      results: [
        {
          id: '1',
          category: { slug: 'test', title: 'Test' },
          publisher: 'Test Publisher',
          title: 'Test Announcement',
          excerpt: 'Test Excerpt',
          body: 'Test Body',
          created_at: DateTime.now().toISO(),
        },
      ],
    }),
  } as unknown as AnnouncementsApi;

  const mockedEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'backstage',
      description: 'backstage.io',
    },
    spec: {
      lifecycle: 'production',
      type: 'service',
      owner: 'user:guest',
    },
  };

  it('should render the Announcements card', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[announcementsApiRef, mockAnnouncementsApi]]}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(entityAnnouncementsCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => expect(screen.getByText('Test Announcement')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
