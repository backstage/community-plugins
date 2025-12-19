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

import { ManageCondition, manageConditionRef } from '../data-refs';

const manageTabTitleRef = createExtensionDataRef<string>().with({
  id: 'manage.tab.title',
});

const manageTabPathRef = createExtensionDataRef<string>().with({
  id: 'manage.tab.path',
});

/** @public */
export type ManageTabFullHeight = {
  fullHeight: boolean;
  resizeChild: boolean;
};

const manageTabFullHeightRef =
  createExtensionDataRef<ManageTabFullHeight>().with({
    id: 'manage.tab.fullHeight',
  });

/**
 * The ManageTabBlueprint allows custom tabs to be added to the Manage page.
 *
 * @public
 */
export const ManageTabBlueprint = createExtensionBlueprint({
  kind: 'manage-tab',
  attachTo: { id: 'page:manage', input: 'tabs' },
  output: [
    manageTabTitleRef,
    manageTabPathRef,
    manageTabFullHeightRef,
    manageConditionRef,
    coreExtensionData.reactElement,
  ],
  dataRefs: {
    title: manageTabTitleRef,
    path: manageTabPathRef,
    fullHeight: manageTabFullHeightRef,
    condition: manageConditionRef,
    element: coreExtensionData.reactElement,
  },
  config: {
    schema: {
      title: z => z.string().optional(),
    },
  },
  *factory(
    params: {
      /** The default path of the tab */
      path: string;
      /** The default title of the tab */
      title: string;
      /**
       * Whether the tab should be full height.
       *
       * If true, the tab content will be wrapped in a div with exact height set
       * and adapt to window resizing. Children can be set to "height: 100%" to
       * ensure they fill the available space.
       *
       * If an object is provided, the `resizeChild` property can be set to true
       * to also resize the first child element (unless it's a progress bar).
       */
      fullHeight?: boolean | { resizeChild: boolean };
      /** The condition to whether displaying the tab */
      condition?: ManageCondition;
      /** The component to render for the tab */
      loader: () => Promise<JSX.Element>;
    },
    { config, node },
  ) {
    const fullHeight: ManageTabFullHeight =
      typeof params.fullHeight === 'object'
        ? {
            fullHeight: true,
            resizeChild: !!params.fullHeight.resizeChild,
          }
        : {
            fullHeight: !!params.fullHeight,
            resizeChild: false,
          };

    yield manageTabTitleRef(config.title ?? params.title ?? params.path);
    yield manageTabPathRef(params.path);
    yield manageTabFullHeightRef(fullHeight);
    yield manageConditionRef(params.condition ?? (() => true));
    yield coreExtensionData.reactElement(
      ExtensionBoundary.lazy(node, params.loader),
    );
  },
});
