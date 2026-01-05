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

import type { Entity } from '@backstage/catalog-model';

import { ManageColumnModule } from '@backstage-community/plugin-manage-react';

import { ManageColumnSimple } from './utils';

/** @public */
export type TableColumn = ManageColumnSimple | ManageColumnModule;

/** @public */
export type TableRow = {
  entity: Entity;
  id: string;
};

export type ColumnInfo = {
  id: string;
  title: string;
  render: (row: TableRow) => ReactNode;
};
