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
  ExtensionBoundary,
} from '@backstage/frontend-plugin-api';

import {
  ManageCondition,
  manageConditionRef,
  manageAttachToRef,
  manageCardRef,
  ManageCardLoader,
} from '../data-refs';

/**
 * The parameters for the ManageEntityCardWidgetBlueprint.
 *
 * @public
 */
export interface ManageCardWidgetParams {
  /** Attach the widgets to tabs of these kinds by default */
  attachTo?: string[];

  /**
   * The condition to whether displaying the widgets (apart from attachTo).
   *
   * This could be e.g. to only show for certain users.
   */
  condition?: ManageCondition;

  /**
   * The card to render for the widget.
   *
   * If this is used, it will replace
   * {@link ManageCardWidgetParams.loader | loader}.
   */
  card?: ManageCardLoader;

  /**
   * The component to render for the widget.
   *
   * This will be used if {@link ManageCardWidgetParams.card | card} is not
   * defined.
   *
   * NOTE; In the case of using this loader, the component is responsible for
   * rendering the entire card. It's generally recommended to use
   * {@link ManageCardWidgetParams.card | card} instead for UI consistency.
   */
  loader?: () => Promise<JSX.Element>;
}

/**
 * The ManageEntityCardWidgetBlueprint allows custom cards to be shown above the
 * entities tables.
 *
 * @public
 */
export const ManageEntityCardWidgetBlueprint = createExtensionBlueprint({
  kind: 'manage-card-widget',
  attachTo: { id: 'page:manage', input: 'cardWidgets' },
  output: [manageCardRef, manageAttachToRef, manageConditionRef],
  dataRefs: {
    card: manageCardRef,
    attachTo: manageAttachToRef,
    condition: manageConditionRef,
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
  *factory(params: ManageCardWidgetParams, { config, node }) {
    const attachTo = config.attachTo ?? params.attachTo;

    if (params.loader) {
      yield manageCardRef({
        element: ExtensionBoundary.lazy(node, params.loader),
      });
    } else if (params.card) {
      yield manageCardRef({
        card: params.card,
      });
    } else {
      throw new Error(
        'Either card or loader must be provided to ManageEntityCardWidgetBlueprint',
      );
    }

    yield manageAttachToRef({ attachTo });
    yield manageConditionRef(params.condition ?? (() => true));
  },
});
