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

import { Fragment, ReactNode } from 'react';

import { ManageContentWidgetAccordion } from '@backstage-community/plugin-manage-react';

import { TableColumn } from '../../components/ManageEntitiesList';
import {
  CardWidgetSpec,
  ContentWidgetSpec,
  ResolvedColumnSpec,
  TabDefinition,
  WithNodeId,
} from './types';

export function ensureTabDefinition<
  T extends Record<string, Partial<TabDefinition>>,
>(obj: T, key: keyof T): TabDefinition {
  if (!obj[key]) {
    obj[key] = {
      cards: [],
      columns: [],
      footer: [],
      header: [],
    } as TabDefinition as T[keyof T];
  }
  return obj[key] as TabDefinition;
}

export function appendCardWidget<
  P extends string,
  T extends Record<P, WithNodeId<{ element: ReactNode }>[]>,
>(obj: T, prop: P, w: CardWidgetSpec) {
  obj[prop].push({
    nodeId: w.node.spec.id,
    element: <Fragment key={w.node.spec.id}>{w.element}</Fragment>,
  });
}

export function appendContentWidget<
  P extends string,
  T extends Record<
    P,
    WithNodeId<{
      element: ReactNode;
      accordion: ManageContentWidgetAccordion;
    }>[]
  >,
>(obj: T, prop: P, w: ContentWidgetSpec) {
  obj[prop].push({
    nodeId: w.node.spec.id,
    accordion: w.accordion,
    element: <Fragment key={w.node.spec.id}>{w.element}</Fragment>,
  });
}

export function appendColumn<
  P extends string,
  T extends Record<P, WithNodeId<TableColumn>[]>,
>(obj: T, prop: P, c: ResolvedColumnSpec, multi: boolean) {
  if (multi && c.resolvedColumnMulti) {
    obj[prop].push({
      nodeId: c.node.spec.id,
      getColumns: c.resolvedColumnMulti,
    });
  } else if (c.resolvedColumnSingle) {
    // Single was selected, or multi wasn't available - try attaching single
    obj[prop].push({
      nodeId: c.node.spec.id,
      getColumn: c.resolvedColumnSingle,
    });
  }
}
