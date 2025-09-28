/*
 * Copyright 2024 The Backstage Authors
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
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { isKubernetesAvailable } from '@backstage/plugin-kubernetes';

export const IsMeshedEntityCard = EntityCardBlueprint.make({
  name: 'is-meshed',
  params: {
    loader: async () => {
      const m = await import('../components/IsMeshedBanner');
      return <m.IsMeshedBanner />;
    },
    filter: isKubernetesAvailable,
  },
});

export const EdgesTableEntityCard = EntityCardBlueprint.make({
  name: 'edges-table',
  params: {
    loader: async () => {
      const m = await import('../components/EdgesTable');
      return <m.EdgesTable />;
    },
    filter: isKubernetesAvailable,
  },
});

export const LinkerdEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/linkerd',
    title: 'Linkerd',
    filter: isKubernetesAvailable,
    loader: async () => {
      const m = await import('../components/DependenciesCard');
      return <m.DependenciesCard />;
    },
  },
});
