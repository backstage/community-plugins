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
import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Allows reading stored MDX card templates.
 *
 * @public
 */
export const mdxCardTemplateReadPermission = createPermission({
  name: 'mdx-card.template.read',
  attributes: { action: 'read' },
});

/**
 * Allows creating MDX card templates. Templates run as JavaScript in the
 * browsers of everyone who views them, so grant this only to trusted users.
 *
 * @public
 */
export const mdxCardTemplateCreatePermission = createPermission({
  name: 'mdx-card.template.create',
  attributes: { action: 'create' },
});

/**
 * Allows updating MDX card templates. Templates run as JavaScript in the
 * browsers of everyone who views them, so grant this only to trusted users.
 *
 * @public
 */
export const mdxCardTemplateUpdatePermission = createPermission({
  name: 'mdx-card.template.update',
  attributes: { action: 'update' },
});

/**
 * Allows deleting MDX card templates.
 *
 * @public
 */
export const mdxCardTemplateDeletePermission = createPermission({
  name: 'mdx-card.template.delete',
  attributes: { action: 'delete' },
});

/**
 * All permissions defined by the MDX card plugin.
 *
 * @public
 */
export const mdxCardPermissions = [
  mdxCardTemplateReadPermission,
  mdxCardTemplateCreatePermission,
  mdxCardTemplateUpdatePermission,
  mdxCardTemplateDeletePermission,
];
