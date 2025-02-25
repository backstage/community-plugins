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
import { ReactNode } from 'react';

import { Entity } from '@backstage/catalog-model';

/** @public */
export interface ManageColumn {
  id: string;
  title: string;
  render: (opts: { entity: Entity }) => ReactNode;
}

/** @public */
export type GetColumnsFunc = (entities: Entity[]) => ManageColumn[];

/** @public */
export type GetColumnFunc = (entities: Entity[]) => ManageColumn;

/** @public */
export interface ManageColumnModuleMultiple {
  getColumns: GetColumnsFunc;
  getColumn?: never;
}
/** @public */
export interface ManageColumnModuleSingle {
  getColumns?: never;
  getColumn: GetColumnFunc;
}

/** @public */
export type ManageColumnModule =
  | ManageColumnModuleMultiple
  | ManageColumnModuleSingle;

/**
 * Check if a column is a set of columns, or a single one
 *
 * @public
 */
export function isManageColumnModuleMultiple(
  column: ManageColumnModule,
): column is ManageColumnModuleMultiple {
  return !!(column as ManageColumnModuleMultiple).getColumns;
}

/**
 * Ensure a column (or multiple columns) are multiple columns, for simplicity
 *
 * @public
 */
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
