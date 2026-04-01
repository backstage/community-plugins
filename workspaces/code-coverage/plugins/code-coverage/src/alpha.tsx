/*
 * Copyright 2026 The Backstage Authors
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
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isCodeCoverageAvailable } from './components/Router';
import { codeCoverageApiRef, CodeCoverageRestApi } from './api';

const codeCoverageApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: codeCoverageApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new CodeCoverageRestApi({ discoveryApi, fetchApi }),
    }),
});

const entityCodeCoverageContent = EntityContentBlueprint.make({
  params: {
    path: '/code-coverage',
    title: 'Code Coverage',
    filter: isCodeCoverageAvailable,
    loader: () => import('./components/Router').then(m => <m.Router />),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'code-coverage',
  extensions: [codeCoverageApi, entityCodeCoverageContent],
});
