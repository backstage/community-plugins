/*
 * Copyright 2025 The Backstage Authors
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
import { mockApis } from '@backstage/test-utils';
import {
  DiscoveryApi,
  ErrorApi,
  FetchApi,
  IdentityApi,
  StorageApi,
} from '@backstage/core-plugin-api';
import { AnnouncementsClient } from './AnnouncementsClient';

const createClient = (storageApi: StorageApi) =>
  new AnnouncementsClient({
    discoveryApi: {
      getBaseUrl: async () => 'http://example.com',
    } as DiscoveryApi,
    identityApi: {
      getCredentials: async () => ({ token: undefined }),
    } as IdentityApi,
    errorApi: { post: jest.fn(), error$: jest.fn() } as unknown as ErrorApi,
    fetchApi: { fetch: jest.fn() } as unknown as FetchApi,
    storageApi,
  });

describe('AnnouncementsClient dismiss tracking', () => {
  it('dismisses announcements independently and idempotently', () => {
    const client = createClient(mockApis.storage());

    expect(client.isAnnouncementDismissed('a')).toBe(false);

    client.dismissAnnouncement('a');
    expect(client.isAnnouncementDismissed('a')).toBe(true);
    // Dismissing one announcement must not affect others.
    expect(client.isAnnouncementDismissed('b')).toBe(false);

    client.dismissAnnouncement('b');
    expect(client.isAnnouncementDismissed('a')).toBe(true);
    expect(client.isAnnouncementDismissed('b')).toBe(true);

    // Dismissing an already-dismissed announcement is a no-op.
    client.dismissAnnouncement('a');
    expect(client.isAnnouncementDismissed('a')).toBe(true);
  });

  it('persists dismissed ids across client instances via shared storage', () => {
    const storageApi = mockApis.storage();
    createClient(storageApi).dismissAnnouncement('persisted');

    // A fresh client backed by the same storage sees the dismissed id.
    expect(createClient(storageApi).isAnnouncementDismissed('persisted')).toBe(
      true,
    );
  });

  it('tracks last seen date with a far-past default before any is set', () => {
    const client = createClient(mockApis.storage());

    expect(client.lastSeenDate().toISO()).toBe(
      DateTime.fromISO('1990-01-01').toISO(),
    );

    const now = DateTime.now();
    client.markLastSeenDate(now);
    expect(client.lastSeenDate().toISO()).toBe(now.toISO());
  });
});
