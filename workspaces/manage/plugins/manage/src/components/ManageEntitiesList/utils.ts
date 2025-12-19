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
import type { ComponentType } from 'react';

import type { Entity } from '@backstage/catalog-model';

import type {
  ManageColumnModule,
  ManageColumnModuleMultiple,
} from '@backstage-community/plugin-manage-react';

/** @public */
export interface ManageColumnSimpleComponentProps {
  entity: Entity;
}

/** @public */
export type ManageColumnSimpleComponent =
  ComponentType<ManageColumnSimpleComponentProps>;

/** @public */
export interface ManageColumnSimple {
  title: string;
  id: string;
  component: ManageColumnSimpleComponent;
}

export function isManageColumnSimple(
  column: ManageColumnSimple | ManageColumnModule,
): column is ManageColumnSimple {
  return !!(column as ManageColumnSimple).component;
}

export function isManageColumnModuleMultiple(
  column: ManageColumnModule,
): column is ManageColumnModuleMultiple {
  return !!(column as ManageColumnModuleMultiple).getColumns;
}

export function simplifyColumns(
  column: ManageColumnModule,
): ManageColumnModuleMultiple {
  if (isManageColumnModuleMultiple(column)) {
    return column;
  }
  return {
    getColumns: (entities: Entity[]) => [column.getColumn(entities)],
  };
}
