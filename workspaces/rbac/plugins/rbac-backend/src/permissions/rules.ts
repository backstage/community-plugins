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
import { createPermissionRule } from '@backstage/plugin-permission-node';
import type { RoleMetadata } from '@backstage-community/plugin-rbac-common';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { permissionMetadataResourceRef } from './resource';

/**
 * The RBACFilter is a simple filter without any conditional criteria.
 *
 */
export type RBACFilter = {
  key: string;
  values: any[];
};

/**
 * The RBACFilters type is a recursive type that can be used to create complex filter structures.
 * It can be used to create filters that are a combination of other filters, or a negation of a filter.
 *
 */
export type RBACFilters =
  | { anyOf: RBACFilters[] }
  | { allOf: RBACFilters[] }
  | { not: RBACFilters }
  | RBACFilter;

const isOwner = createPermissionRule({
  name: 'IS_OWNER',
  description:
    'Should allow access to RBAC roles and Permissions through ownership',
  resourceRef: permissionMetadataResourceRef,
  paramsSchema: z.object({
    owners: z.string().array().describe('List of entity refs to match against'),
  }),
  apply: (roleMeta: RoleMetadata, { owners }) => {
    if (!roleMeta.owner) {
      return false;
    }
    return owners.includes(roleMeta.owner);
  },
  toQuery: ({ owners }) => ({
    key: 'owners',
    values: owners,
  }),
});

export const rbacRules = {
  name: isOwner.name,
  description: isOwner.description,
  resourceType: isOwner.resourceType,
  paramsSchema: zodToJsonSchema(isOwner.paramsSchema ?? z.object({})),
};

export const rules = { isOwner };
