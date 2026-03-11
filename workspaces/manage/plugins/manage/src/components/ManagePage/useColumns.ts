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

import { ManageConditionOptions } from '@backstage-community/plugin-manage-react';

import { MANAGE_KIND_COMMON } from '../../components/ManageTabs';
import { useAsyncListFilter } from '../../hooks/useAsyncListFilter';
import { ColumnSpec, ManagePageOptions, ResolvedColumnSpec } from './types';
import { parseAttachToMulti } from './attach-to';
import { appendColumn, ensureTabDefinition } from './utils';

export function useColumns(
  columns: ColumnSpec[],
  conditionOptions: ManageConditionOptions,
  { combined, starred, kinds }: ManagePageOptions,
) {
  const filteredColumns = useAsyncListFilter(columns, {
    conditionOptions: conditionOptions,
    getCondition: colSpec => (!colSpec.condition ? true : colSpec.condition),
    map: async (colSpec): Promise<ResolvedColumnSpec> => {
      const resolvedColumnSingle = await colSpec.column.columnsSingle?.(
        conditionOptions,
      );
      const resolvedColumnMulti = await colSpec.column.columnsMulti?.(
        conditionOptions,
      );

      return {
        node: colSpec.node,
        condition: colSpec.condition,
        attachTo: colSpec.attachTo,
        resolvedColumnSingle,
        resolvedColumnMulti,
      };
    },
    getErrorMessage: (colSpec, errorMessage) => {
      return `Loading column(s) "${colSpec.node.spec.id}" failed: ${errorMessage}`;
    },
  });

  filteredColumns.forEach(c => {
    if ('column' in c) {
      // Unresolved
      return;
    }

    const attachTabs = parseAttachToMulti(c.attachTo);
    if (attachTabs.entities.show) {
      appendColumn(combined, 'columns', c, attachTabs.entities.multi);
    }
    if (attachTabs.starred.show && starred !== false) {
      appendColumn(starred, 'columns', c, attachTabs.starred.multi);
    }
    if (attachTabs.all.show) {
      const def = ensureTabDefinition(kinds, MANAGE_KIND_COMMON);
      appendColumn(def, 'columns', c, attachTabs.all.multi);
    } else {
      attachTabs.tabs.forEach(kind => {
        const def = ensureTabDefinition(kinds, kind.tab);
        appendColumn(def, 'columns', c, kind.multi);
      });
    }
  });
}
