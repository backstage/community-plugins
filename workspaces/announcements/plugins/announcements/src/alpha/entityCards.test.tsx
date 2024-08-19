import { createExtensionTester } from '@backstage/frontend-test-utils';
import { entityAnnouncementsCard } from './entityCards';
import { screen, waitFor } from '@testing-library/react';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import {
  AnnouncementsApi,
  announcementsApiRef,
} from '@procore-oss/backstage-plugin-announcements-react';
import { DateTime } from 'luxon';

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
  const mockAnnouncementsApi = createApiExtension({
    factory: createApiFactory({
      api: announcementsApiRef,
      deps: {},
      factory: () =>
        ({
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
        } as unknown as AnnouncementsApi),
    }),
  });

  it('should render the Announcements card', async () => {
    createExtensionTester(entityAnnouncementsCard)
      .add(mockAnnouncementsApi)
      .render();

    await waitFor(
      () => expect(screen.getByText('Test Announcement')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
