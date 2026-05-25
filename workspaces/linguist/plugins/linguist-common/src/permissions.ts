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
import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permission to read entity language breakdowns.
 * @public
 */
export const linguistReadPermission = createPermission({
  name: 'linguist.entities.read',
  attributes: {
    action: 'read',
  },
});

/**
 * Permission to trigger entity processing.
 * @public
 */
export const linguistProcessPermission = createPermission({
  name: 'linguist.entities.process',
  attributes: {
    action: 'update',
  },
});

/**
 * List of all Linguist permissions.
 * @public
 */
export const linguistPermissions = [
  linguistReadPermission,
  linguistProcessPermission,
];
