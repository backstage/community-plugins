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

/**
 * The ManageHeaderLabelBlueprint allows custom header <Label> elements to be
 * added to the Manage page.
 *
 * @public
 */
export const ManageHeaderLabelBlueprint = createExtensionBlueprint({
  kind: 'manage-header-label',
  attachTo: { id: 'page:manage', input: 'headerLabels' },
  output: [coreExtensionData.reactElement],
  dataRefs: {
    element: coreExtensionData.reactElement,
  },
  *factory(params: { loader: () => Promise<JSX.Element> }, { node }) {
    const loader = params.loader;

    yield coreExtensionData.reactElement(ExtensionBoundary.lazy(node, loader));
  },
});
