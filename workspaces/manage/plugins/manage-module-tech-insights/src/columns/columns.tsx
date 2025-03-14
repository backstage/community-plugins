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
import type { Check } from '@backstage-community/plugin-tech-insights-common/client';
import type { ManageColumnModule } from '@backstage-community/plugin-manage-react';

import { makeGetColumn } from './columns-single';
import { makeGetColumns } from './columns-multiple';

/**
 * Options for {@link manageTechInsightsColumns}.
 *
 * @public
 */
export interface ManageTechInsightsOptions {
  /** Combine all checks into a single columns with percentage bar */
  combined?: boolean;

  /** Only use these checks (defaults to all). */
  checkFilter?: (check: Check) => boolean;

  /** Also show checks that are empty for all entities of the certain kind. */
  showEmpty?: boolean;
}

/**
 * Create a column module for displaying tech insights checks.
 *
 * @public
 */
export function manageTechInsightsColumns(
  options?: ManageTechInsightsOptions,
): ManageColumnModule {
  const { combined = false, checkFilter, showEmpty = false } = options ?? {};

  if (combined) {
    return {
      getColumn: makeGetColumn(checkFilter, showEmpty),
    };
  }
  return {
    getColumns: makeGetColumns(checkFilter, showEmpty),
  };
}
