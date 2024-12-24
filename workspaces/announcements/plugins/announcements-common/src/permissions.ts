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
import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permission to create new announcements
 *
 * @public
 */
export const announcementCreatePermission = createPermission({
  name: 'announcement.entity.create',
  attributes: { action: 'create' },
});

/**
 * Permission to delete announcements
 *
 * @public
 */
export const announcementDeletePermission = createPermission({
  name: 'announcement.entity.delete',
  attributes: { action: 'delete' },
});

/**
 * Permission to update announcements
 *
 * @public
 */
export const announcementUpdatePermission = createPermission({
  name: 'announcement.entity.update',
  attributes: { action: 'update' },
});

/**
 * Collection of all announcement-related permissions
 *
 * @public
 */
export const announcementEntityPermissions = {
  announcementCreatePermission,
  announcementDeletePermission,
  announcementUpdatePermission,
};
