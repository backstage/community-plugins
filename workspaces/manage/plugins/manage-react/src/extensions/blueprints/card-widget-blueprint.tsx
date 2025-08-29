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
  coreExtensionData,
  createExtensionBlueprint,
  ExtensionBoundary,
} from '@backstage/frontend-plugin-api';

import {
  ManageCondition,
  manageConditionRef,
  manageAttachToRef,
} from '../data-refs';

/**
 * The ManageEntityCardWidgetBlueprint allows custom cards to be shown above the
 * entities tables.
 *
 * @public
 */
export const ManageEntityCardWidgetBlueprint = createExtensionBlueprint({
  kind: 'manage-card-widget',
  attachTo: { id: 'page:manage', input: 'cardWidgets' },
  output: [
    manageAttachToRef,
    manageConditionRef,
    coreExtensionData.reactElement,
  ],
  dataRefs: {
    attachTo: manageAttachToRef,
    condition: manageConditionRef,
    element: coreExtensionData.reactElement,
  },
  config: {
    schema: {
      attachTo: z =>
        z
          .array(z.string())
          .optional()
          .describe(
            'Attach the widget to tabs of these kinds. ' +
              'The special value "$entities" means the combined tab Entities, ' +
              'the special value "$all" means all individual kinds, ' +
              'and the special value "$starred" means the Starred tab.',
          ),
    },
  },
  *factory(
    params: {
      /** Attach the widgets to tabs of these kinds by default */
      attachTo?: string[];
      /**
       * The condition to whether displaying the widgets (apart from attachTo).
       *
       * This could be e.g. to only show for certain users.
       */
      condition?: ManageCondition;
      /** The component to render for the widgets */
      loader: () => Promise<JSX.Element>;
    },
    { config, node },
  ) {
    const attachTo = config.attachTo ?? params.attachTo;

    yield coreExtensionData.reactElement(
      ExtensionBoundary.lazy(node, params.loader),
    );
    // yield manageWidgetTypeRef(params.type);
    yield manageAttachToRef({ attachTo });
    yield manageConditionRef(params.condition ?? (() => true));
  },
});
