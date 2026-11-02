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
  createPermission,
  isPermission,
  Permission,
} from '@backstage/plugin-permission-common';

/**
 * The resource type identifier for feedback entities.
 *
 * @public
 */
export const RESOURCE_TYPE_FEEDBACK = 'feedback';

/**
 * Permission to read feedback and issues.
 *
 * @public
 */
export const feedbackReadPermission = createPermission({
  name: 'feedback.read',
  attributes: { action: 'read' },
});

/**
 * Permission to create new feedback or bug reports.
 *
 * @public
 */
export const feedbackCreatePermission = createPermission({
  name: 'feedback.create',
  attributes: { action: 'create' },
});

/**
 * Permission to update existing feedback details.
 * This is a resource-specific permission tied to the feedback resource type.
 *
 * @public
 */
export const feedbackUpdatePermission = createPermission({
  name: 'feedback.update',
  attributes: { action: 'update' },
  resourceType: RESOURCE_TYPE_FEEDBACK,
});

/**
 * Permission to permanently delete feedback.
 * This is a resource-specific permission tied to the feedback resource type.
 *
 * @public
 */
export const feedbackDeletePermission = createPermission({
  name: 'feedback.delete',
  attributes: { action: 'delete' },
  resourceType: RESOURCE_TYPE_FEEDBACK,
});

/**
 * List of all standard feedback permissions.
 *
 * @public
 */
export const feedbackPermissions = [
  feedbackReadPermission,
  feedbackCreatePermission,
  feedbackUpdatePermission,
  feedbackDeletePermission,
];

/**
 * Helper function to determine if a given permission is one of the feedback permissions.
 *
 * @param permission - The permission to check
 * @returns true if the permission belongs to the feedback plugin permissions
 *
 * @public
 */
export const isFeedbackPermission = (permission: Permission) =>
  feedbackPermissions.some(pred => isPermission(pred, permission));
