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
 * Permission to access the Agentic Chat plugin.
 *
 * Controls access to ALL Agentic Chat features. If a user has this
 * permission, they get full access. If not, they are blocked entirely.
 *
 * @public
 */
export const agenticChatAccessPermission = createPermission({
  name: 'agenticChat.access',
  attributes: {
    action: 'read',
  },
});

/**
 * Permission to access admin features of the Agentic Chat plugin.
 *
 * Controls access to admin-only features such as document management,
 * swim lane/prompt editing, system prompt configuration, and branding.
 * Users with this permission see additional admin tabs in the UI.
 *
 * @public
 */
export const agenticChatAdminPermission = createPermission({
  name: 'agenticChat.admin',
  attributes: {
    action: 'update',
  },
});

/**
 * List of all Agentic Chat permissions.
 *
 * To restrict access to a Keycloak group, configure RBAC policies in app-config.yaml:
 *
 * @example
 * ```yaml
 * permission:
 *   enabled: true
 *   rbac:
 *     policies:
 *       - g, group:default/agentic-chat-users, role:default/agentic-chat-user
 *       - p, role:default/agentic-chat-user, agenticChat.access, read, allow
 *       - g, group:default/agentic-chat-admins, role:default/agentic-chat-admin
 *       - p, role:default/agentic-chat-admin, agenticChat.access, read, allow
 *       - p, role:default/agentic-chat-admin, agenticChat.admin, update, allow
 * ```
 *
 * @public
 */
export const agenticChatPermissions = [
  agenticChatAccessPermission,
  agenticChatAdminPermission,
];
