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
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../../routes';

const topologyEntityContent = EntityContentBlueprint.makeWithOverrides({
  name: 'entity-content-topology',
  factory(original) {
    return original({
      path: '/topology',
      title: 'Topology',
      routeRef: rootRouteRef,
      loader: async () => {
        const { TopologyComponent } = await import('../../components/Topology');
        return <TopologyComponent />;
      },
    });
  },
});

/** @alpha */
export const topologyCatalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [topologyEntityContent],
});
