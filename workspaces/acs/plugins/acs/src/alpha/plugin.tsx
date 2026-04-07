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
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { type Entity } from '@backstage/catalog-model';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';

export const EntityACSContent = EntityContentBlueprint.make({
  name: 'acs-content',
  params: {
    title: 'Security',
    path: '/acs',
    filter: (entity: Entity) =>
      entity.metadata.annotations !== undefined &&
      'acs/deployment-name' in entity.metadata.annotations,
    async loader() {
      return import('../components/ACSComponent').then(m => <m.ACSComponent />);
    },
  },
});

export default createFrontendPlugin({
  pluginId: 'acs',
  info: { packageJson: () => import('../../package.json') },
  extensions: [EntityACSContent],
});
