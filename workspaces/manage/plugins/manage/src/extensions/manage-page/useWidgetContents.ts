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
import { ManagePageOptions, ContentWidgetSpec } from './types';
import { parseAttachTo } from './attach-to';
import { appendContentWidget, ensureTabDefinition } from './utils';

export function useWidgetContents(
  widgets: ContentWidgetSpec[],
  conditionOptions: ManageConditionOptions,
  { isContentFooter, combined, starred, kinds }: ManagePageOptions,
) {
  const filteredWidgetContents = useAsyncListFilter(widgets, {
    conditionOptions: conditionOptions,
    getCondition: widget => (!widget.condition ? true : widget.condition),
    getErrorMessage: (widget, errorMessage) => {
      return `Loading widget "${widget.node.spec.id}" failed: ${errorMessage}`;
    },
  });

  filteredWidgetContents.forEach(w => {
    const position: 'header' | 'footer' = isContentFooter(w.node.spec.id)
      ? 'footer'
      : 'header';
    const attachTabs = parseAttachTo(w.attachTo);

    if (attachTabs.entities) {
      appendContentWidget(combined, position, w);
    }
    if (attachTabs.starred && starred !== false) {
      appendContentWidget(starred, position, w);
    }
    if (attachTabs.all) {
      appendContentWidget(
        ensureTabDefinition(kinds, MANAGE_KIND_COMMON),
        position,
        w,
      );
    } else {
      attachTabs.tabs.forEach(kind => {
        appendContentWidget(ensureTabDefinition(kinds, kind), position, w);
      });
    }
  });
}
