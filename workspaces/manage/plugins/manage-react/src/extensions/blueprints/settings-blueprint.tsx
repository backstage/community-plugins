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

/** @public */
const manageSettingsDataRef = createExtensionDataRef<{
  title: string;
  subtitle?: string;
  action?: JSX.Element;
}>().with({
  id: 'manage.settings.data',
});

/**
 * The ManageSettingsBlueprint allows custom settings widgets to be added to the
 * settings page.
 *
 * @public
 */
export const ManageSettingsBlueprint = createExtensionBlueprint({
  kind: 'manage-settings',
  attachTo: { id: 'page:manage', input: 'settings' },
  output: [manageSettingsDataRef, coreExtensionData.reactElement],
  dataRefs: {
    data: manageSettingsDataRef,
    element: coreExtensionData.reactElement,
  },
  config: {
    schema: {
      title: z => z.string().optional(),
      subtitle: z => z.string().optional(),
    },
  },
  *factory(
    params: {
      /** The default title of the tab */
      title: string;
      /** The default title of the tab */
      subtitle?: string;
      /** The element to render for the tab */
      loader: () => Promise<JSX.Element>;
      /** An optional element to render as actions in the card header */
      actionLoader?: () => Promise<JSX.Element>;
    },
    { config, node },
  ) {
    yield manageSettingsDataRef({
      title: config.title ?? params.title,
      subtitle: config.subtitle ?? params.subtitle,
      action: params.actionLoader
        ? ExtensionBoundary.lazy(node, params.actionLoader)
        : undefined,
    });
    yield coreExtensionData.reactElement(
      ExtensionBoundary.lazy(node, params.loader),
    );
  },
});
