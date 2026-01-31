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

import { DateTime } from 'luxon';
import { screen } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import { AnnouncementsTable } from './AnnouncementsTable';
import { rootRouteRef } from '../../../../routes';

const mockCatalogApi = catalogApiMock.mock();

const renderAnnouncementsTable = async (announcements: Announcement[]) => {
  await renderInTestApp(
    <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
      <AnnouncementsTable data={announcements} />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
        '/catalog/:namespace/:kind/:name': entityRouteRef,
      },
    },
  );
};

describe('AnnouncementsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCatalogApi.getEntityByRef.mockReset();
  });

  it('renders empty state when no announcements', async () => {
    await renderAnnouncementsTable([]);

    expect(screen.getByText(/No announcements found/i)).toBeInTheDocument();
  });

  describe('publisher', () => {
    it('renders announcement with valid entityRef publisher', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementsTable([announcement]);

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    });

    it('renders empty placeholder when publisher is missing', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: '',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementsTable([announcement]);

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
      // Should not crash - empty placeholder should be rendered
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('handles invalid entityRef publisher gracefully without crashing', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'invalid-entity-ref',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      // This should not throw an error
      await expect(
        renderAnnouncementsTable([announcement]),
      ).resolves.not.toThrow();

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    });

    it('handles malformed entityRef publisher gracefully without crashing', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'fdasfdsafs',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      // This should not throw an error
      await expect(
        renderAnnouncementsTable([announcement]),
      ).resolves.not.toThrow();

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('renders multiple announcements with mixed valid and invalid publishers', async () => {
      const announcements: Announcement[] = [
        {
          id: '1',
          title: 'Valid Publisher',
          excerpt: 'Excerpt 1',
          body: 'Body 1',
          publisher: 'user:default/valid-user',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
        },
        {
          id: '2',
          title: 'Invalid Publisher',
          excerpt: 'Excerpt 2',
          body: 'Body 2',
          publisher: 'invalid-ref',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
        },
        {
          id: '3',
          title: 'No Publisher',
          excerpt: 'Excerpt 3',
          body: 'Body 3',
          publisher: '',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
        },
      ];

      // This should not throw an error
      await expect(
        renderAnnouncementsTable(announcements),
      ).resolves.not.toThrow();

      expect(screen.getByText('Valid Publisher')).toBeInTheDocument();
      expect(screen.getByText('Invalid Publisher')).toBeInTheDocument();
      expect(screen.getByText('No Publisher')).toBeInTheDocument();
    });

    it('displays on behalf of information when present', async () => {
      const mockPublisher = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: { name: 'test-user', namespace: 'default' },
      };

      const mockTeam = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: { name: 'test-team', namespace: 'default' },
        spec: { profile: { displayName: 'Test Team' } },
      };

      mockCatalogApi.getEntityByRef.mockImplementation(
        async (
          entityRef: string | { kind: string; namespace: string; name: string },
        ) => {
          const refString =
            typeof entityRef === 'string'
              ? entityRef
              : `${entityRef.kind}:${entityRef.namespace}/${entityRef.name}`;
          if (refString === 'user:default/test-user') {
            return mockPublisher;
          }
          if (refString === 'group:default/test-team') {
            return mockTeam;
          }
          return undefined;
        },
      );

      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        on_behalf_of: 'group:default/test-team',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementsTable([announcement]);

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
      // Check that the on behalf of text is present (translation key lowercased)
      expect(
        screen.getByText(
          /admin\.announcementsContent\.table\.onBehalfOf|on behalf of/i,
        ),
      ).toBeInTheDocument();
      // Check that the on behalf of entity reference link is present
      // EntityRefLink will render the entity name or displayName
      const onBehalfOfLink = screen.getByRole('link', {
        name: /test-team|Test Team/i,
      });
      expect(onBehalfOfLink).toBeInTheDocument();
    });

    it('does not display on behalf of when not present', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementsTable([announcement]);

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
      // Should not have any on behalf of links
      const onBehalfOfLinks = screen.queryAllByRole('link', {
        name: /group:default\/test-team/i,
      });
      expect(onBehalfOfLinks).toHaveLength(0);
    });

    it('does not display on behalf of when invalid entityRef', async () => {
      const announcement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        on_behalf_of: 'invalid-entity-ref',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementsTable([announcement]);

      expect(screen.getByText('Test Announcement')).toBeInTheDocument();
      // Should not display invalid on_behalf_of
      const onBehalfOfLinks = screen.queryAllByRole('link', {
        name: /invalid-entity-ref/i,
      });
      expect(onBehalfOfLinks).toHaveLength(0);
    });
  });
});
