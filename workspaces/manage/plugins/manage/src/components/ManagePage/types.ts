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

import { ReactElement, ReactNode } from 'react';
import { AppNode } from '@backstage/frontend-plugin-api';

import {
  GetColumnFunc,
  GetColumnsFunc,
  ManageCardRef,
  ManageCondition,
  ManageConditionOptions,
  ManageContentWidgetAccordion,
} from '@backstage-community/plugin-manage-react';

import { TableColumn } from '../../components/ManageEntitiesList';
import { SubRouteTab } from '../../components/ManageTabs';

export type WithNodeId<T extends {}> = T & { nodeId: string };

export interface TabDefinition {
  cards: WithNodeId<{ element: ReactElement }>[];
  header: WithNodeId<{
    element: ReactNode;
    accordion: ManageContentWidgetAccordion;
  }>[];
  footer: WithNodeId<{
    element: ReactNode;
    accordion: ManageContentWidgetAccordion;
  }>[];
  columns: WithNodeId<TableColumn>[];
}

export interface ManagePageOptions {
  isContentFooter: (id: string) => boolean;
  combined: TabDefinition;
  kinds: Record<string, TabDefinition>;
  starred: false | TabDefinition;
}

export type DecoratedSubRouteTab = SubRouteTab & {
  node: AppNode;
  condition: ManageCondition;
};

export type CardWidgetSpecInput = {
  node: AppNode;
  attachTo: string[] | undefined;
  condition: ManageCondition;
  card: ManageCardRef;
};

export type CardWidgetSpec = {
  node: AppNode;
  attachTo: string[] | undefined;
  condition: ManageCondition;
  element: React.JSX.Element;
};

export type ContentWidgetSpec = {
  node: AppNode;
  accordion: ManageContentWidgetAccordion;
  attachTo: string[] | undefined;
  condition: ManageCondition;
  element: React.JSX.Element;
};

export type ColumnSpec = {
  node: AppNode;
  column: {
    columnsSingle?: (options: ManageConditionOptions) => Promise<GetColumnFunc>;
    columnsMulti?: (options: ManageConditionOptions) => Promise<GetColumnsFunc>;
  };
  condition: ManageCondition;
  attachTo: (string | { tab: string; multi?: boolean })[] | undefined;
};

export type ResolvedColumnSpec = {
  node: AppNode;
  resolvedColumnSingle: GetColumnFunc | undefined; // Populated once loaded
  resolvedColumnMulti: GetColumnsFunc | undefined; // Populated once loaded
  condition: ManageCondition;
  attachTo: (string | { tab: string; multi?: boolean })[] | undefined;
};
