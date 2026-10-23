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
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import {
  GetNotificationsOptions,
  NotificationsApi,
  notificationsApiRef,
  UpdateNotificationsOptions,
} from '@backstage/plugin-notifications';
import {
  Notification,
  NotificationSettings,
  NotificationStatus,
} from '@backstage/plugin-notifications-common';
import {
  ScaffolderApi,
  scaffolderApiRef,
} from '@backstage/plugin-scaffolder-react';
import { mockEntities, mockNotifications } from './mockData';

/** Replaces `api:catalog` with an in-memory catalog. */
export const catalogMockModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams(catalogApiMock.factory({ entities: mockEntities })),
    }),
  ],
});

/** Enough of the scaffolder API for the template list and the task list. */
const scaffolderMock = {
  listTasks: async () => ({ tasks: [], totalTasks: 0 }),
  listActions: async () => [],
  listTemplatingExtensions: async () => ({
    filters: {},
    globals: { functions: {}, values: {} },
  }),
  getIntegrationsList: async () => ({ integrations: [] }),
  getTemplateParameterSchema: async () => {
    const template = mockEntities.find(e => e.kind === 'Template');
    const spec = template?.spec as { parameters?: object[] } | undefined;
    return {
      title: template?.metadata.title ?? 'Template',
      description: template?.metadata.description,
      steps: (spec?.parameters ?? []).map(schema => ({
        title: (schema as { title?: string }).title ?? 'Step',
        schema,
      })),
    };
  },
  scaffold: async () => {
    throw new Error('Scaffolding is not available in the guided tour dev app');
  },
  getTask: async () => {
    throw new Error('No tasks in the guided tour dev app');
  },
  autocomplete: async () => ({ results: [] }),
} as unknown as ScaffolderApi;

/** Replaces `api:scaffolder` with the mock above. */
export const scaffolderMockModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: scaffolderApiRef,
          deps: {},
          factory: () => scaffolderMock,
        }),
    }),
  ],
});

/** `undefined` keeps the current date, true stamps now, false clears it. */
const toggle = (
  current: Date | undefined,
  flag: boolean | undefined,
  now: Date,
) => {
  if (flag === undefined) return current;
  return flag ? now : undefined;
};

/** In-memory notifications with working read/saved toggles. */
class MockNotificationsApi implements NotificationsApi {
  private notifications: Notification[] = [...mockNotifications];

  async getNotifications(options: GetNotificationsOptions = {}) {
    const { read, saved, search, offset = 0, limit = 20 } = options;
    const matches = this.notifications
      .filter(n => read === undefined || !!n.read === read)
      .filter(n => saved === undefined || !!n.saved === saved)
      .filter(
        n =>
          !search ||
          `${n.payload.title} ${n.payload.description ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
      .sort((a, b) => b.created.getTime() - a.created.getTime());
    return {
      notifications: matches.slice(offset, offset + limit),
      totalCount: matches.length,
    };
  }

  async getNotification(id: string) {
    const found = this.notifications.find(n => n.id === id);
    if (!found) {
      throw new Error(`Notification ${id} not found`);
    }
    return found;
  }

  async getStatus(): Promise<NotificationStatus> {
    const unread = this.notifications.filter(n => !n.read).length;
    return { unread, read: this.notifications.length - unread };
  }

  async updateNotifications(options: UpdateNotificationsOptions) {
    const now = new Date();
    this.notifications = this.notifications.map(n => {
      if (!options.ids.includes(n.id)) return n;
      return {
        ...n,
        read: toggle(n.read, options.read, now),
        saved: toggle(n.saved, options.saved, now),
        updated: now,
      };
    });
    return this.notifications.filter(n => options.ids.includes(n.id));
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return { channels: [] };
  }

  async updateNotificationSettings(settings: NotificationSettings) {
    return settings;
  }

  async getTopics() {
    return {
      topics: [
        ...new Set(this.notifications.map(n => n.payload.topic ?? '')),
      ].filter(Boolean),
    };
  }
}

/** Replaces `api:notifications` with the in-memory implementation. */
export const notificationsMockModule = createFrontendModule({
  pluginId: 'notifications',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: notificationsApiRef,
          deps: {},
          factory: () => new MockNotificationsApi(),
        }),
    }),
  ],
});
