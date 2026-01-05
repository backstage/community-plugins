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
  createExtensionDataRef,
  ExtensionBoundary,
} from '@backstage/frontend-plugin-api';

import {
  ManageCondition,
  manageConditionRef,
  manageAttachToRef,
} from '../data-refs';

/** @public */
export type ManageContentWidgetAccordionTitle =
  | string
  | ((options: {
      /** The current tab kind or '$starred' or '$entities' */
      currentTab: string;
      /**
       * The current tab kind title, as returned from `useCurrentKindTitle()`,
       * such as "components" or "starred entities".
       */
      kindTitle: string;
    }) => string);

/** @public */
export interface ManageContentWidgetAccordion {
  title: ManageContentWidgetAccordionTitle;
  show: boolean | Record<string, boolean>;
  showTitle: boolean;
  defaultExpanded: boolean;
  perKind: boolean;
  key: string;
}

const manageContentAccordionRef =
  createExtensionDataRef<ManageContentWidgetAccordion>().with({
    id: 'manage.content-widget',
  });

/**
 * The ManageTabBlueprint allows custom tabs to be added to the Manage page.
 *
 * @public
 */
export const ManageEntityContentWidgetBlueprint = createExtensionBlueprint({
  kind: 'manage-content-widget',
  attachTo: { id: 'page:manage', input: 'contentWidgets' },
  output: [
    manageContentAccordionRef,
    manageAttachToRef,
    manageConditionRef,
    coreExtensionData.reactElement,
  ],
  dataRefs: {
    accordion: manageContentAccordionRef,
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
      inAccordion: z =>
        z.union([z.boolean(), z.record(z.string(), z.boolean())]).optional(),
      accordionDefaultExpanded: z => z.boolean().optional(),
      accordionPerKind: z => z.boolean().optional(),
      showTitle: z => z.boolean().optional(),
    },
  },
  *factory(
    params: {
      /**
       * Accordion options.
       *
       * Even if an accordion is not used by default, the title (and show being
       * potentially false) is needed here to configure the accordion behavior,
       * as an implementer may choose to enable the accordion, via the config.
       */
      accordion: {
        /**
         * Render the cards inside an accordion by default or not.
         *
         * Can be either a boolean (for all tabs) or a record of tab kind to
         * boolean.
         *
         * Defaults to true.
         */
        show?: boolean | Record<string, boolean>;

        /**
         * Title of the accordion, if such is used.
         */
        accordionTitle: ManageContentWidgetAccordionTitle;

        /**
         * Whether the accordion should be expanded by default.
         *
         * Defaults to false.
         */
        defaultExpanded?: boolean;

        /**
         * Whether to save the open/closed state of the accordion per kind
         *
         * Defaults to false.
         */
        perKind?: boolean;

        /**
         * Accordion key, which is used to persist open/closed state in user
         * storage.
         *
         * If left unset, the node id will be used.
         */
        key?: string;
      };

      /** Show the accordion title even when not in an accordion */
      showTitle?: boolean;

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
    yield manageAttachToRef({ attachTo });
    yield manageContentAccordionRef({
      key: params.accordion.key ?? node.spec.id,
      title: params.accordion.accordionTitle,
      show: config.inAccordion ?? params.accordion.show ?? true,
      showTitle: config.showTitle ?? params.showTitle ?? false,
      defaultExpanded:
        config.accordionDefaultExpanded ??
        params.accordion.defaultExpanded ??
        false,
      perKind: config.accordionPerKind ?? params.accordion.perKind ?? false,
    });
    yield manageConditionRef(params.condition ?? (() => true));
  },
});
