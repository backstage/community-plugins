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
import { compatWrapper } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const acsEntityContent = EntityContentBlueprint.make({
  name: 'security',
  params: {
    path: 'acs',
    title: 'Security',
    filter: entity =>
      Boolean(entity.metadata.annotations?.['acs/deployment-name']?.trim()),
    loader: () =>
      import('./components/ACSComponent').then(m =>
        compatWrapper(<m.ACSComponent />),
      ),
  },
});

/**
 * The Advanced Cluster Security plugin for the new frontend system.
 *
 * @alpha
 */
const acsPlugin = createFrontendPlugin({
  pluginId: 'acs',
  extensions: [acsEntityContent],
});

export default acsPlugin;
