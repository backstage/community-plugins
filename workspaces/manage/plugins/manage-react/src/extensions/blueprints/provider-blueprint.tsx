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

import { ReactNode } from 'react';

import {
  createExtensionBlueprint,
  createExtensionDataRef,
  ExtensionBoundary,
} from '@backstage/frontend-plugin-api';

const manageProviderDataRef = createExtensionDataRef<{
  provider: (props: { children?: ReactNode }) => JSX.Element;
  props: Record<string, unknown>;
}>().with({
  id: 'manage.provider.ref',
});

/**
 * The ManageProviderBlueprint allows custom providers to wrap the entire
 * manage page.
 *
 * @public
 */
export const ManageProviderBlueprint = createExtensionBlueprint({
  kind: 'manage-provider',
  attachTo: { id: 'page:manage', input: 'providers' },
  output: [manageProviderDataRef],
  dataRefs: {
    provider: manageProviderDataRef,
  },
  *factory(
    params: {
      /** The provider component */
      loader: () => Promise<(props: { children?: ReactNode }) => JSX.Element>;

      /** The props to pass to the provider component */
      props?: Record<string, unknown>;
    },
    { node },
  ) {
    yield manageProviderDataRef({
      provider: ExtensionBoundary.lazyComponent(node, params.loader),
      props: params.props ?? {},
    });
  },
});
