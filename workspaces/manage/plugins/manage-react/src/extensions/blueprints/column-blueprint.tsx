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

import {
  createExtensionBlueprint,
  createExtensionDataRef,
} from '@backstage/frontend-plugin-api';

import {
  GetColumnFunc,
  GetColumnsFunc,
} from '../../components/column-providers/types';
import {
  ManageCondition,
  manageConditionRef,
  manageAttachToMultiRef,
  ManageConditionOptions,
} from '../data-refs';

const manageColumnRef = createExtensionDataRef<{
  columnsSingle?: (options: ManageConditionOptions) => Promise<GetColumnFunc>;
  columnsMulti?: (options: ManageConditionOptions) => Promise<GetColumnsFunc>;
}>().with({
  id: 'manage.column',
});

/**
 * The ManageEntityColumnBlueprint allows custom columns to be added to the
 * entities tables
 *
 * @public
 */
export const ManageEntityColumnBlueprint = createExtensionBlueprint({
  kind: 'manage-column',
  attachTo: { id: 'page:manage', input: 'columns' },
  output: [manageColumnRef, manageAttachToMultiRef, manageConditionRef],
  dataRefs: {
    column: manageColumnRef,
    attachTo: manageAttachToMultiRef,
    condition: manageConditionRef,
  },
  config: {
    schema: {
      attachTo: z =>
        z
          .array(
            z.union([
              z.string(),
              z.object({ tab: z.string(), multi: z.boolean().optional() }),
            ]),
          )
          .optional()
          .describe(
            'Attach the columns to tabs of these kinds. ' +
              'The special value "$entities" means the combined tab Entities, ' +
              'the special value "$all" means all individual kinds, ' +
              'and the special value "$starred" means the Starred tab.',
          ),
    },
  },
  *factory(
    params: {
      /** The loader of a single column */
      loaderSingle?: (
        options: ManageConditionOptions,
      ) => Promise<GetColumnFunc>;
      /** The loader of a multiple columns */
      loaderMulti?: (
        options: ManageConditionOptions,
      ) => Promise<GetColumnsFunc>;

      /** Attach the columns to tabs of these kinds by default */
      attachTo?: (string | { tab: string; multi?: boolean })[];
      /**
       * The condition to whether displaying the columns (apart from attachTo).
       *
       * This could be e.g. to only show for certain users.
       */
      condition?: ManageCondition;
    },
    { config },
  ) {
    const attachTo = config.attachTo ?? params.attachTo;

    yield manageColumnRef({
      columnsSingle: params.loaderSingle,
      columnsMulti: params.loaderMulti,
    });
    yield manageAttachToMultiRef({ attachTo });
    yield manageConditionRef(params.condition ?? (() => true));
  },
});
