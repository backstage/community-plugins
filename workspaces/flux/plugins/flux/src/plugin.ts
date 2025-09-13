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
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * The Flux plugin.
 * @public
 */
export const fluxPlugin = createPlugin({
  id: 'weaveworks-flux',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Card used to show the state of Flux HelmReleases for an Entity.
 * @public
 */
export const EntityFluxHelmReleasesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmReleasesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxHelmReleasesCard').then(
          m => m.EntityFluxHelmReleasesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux GitRepositories for an Entity.
 * @public
 */
export const EntityFluxGitRepositoriesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxGitRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxGitRepositoriesCard').then(
          m => m.EntityFluxGitRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux OCIRepositories for an Entity.
 * @public
 */
export const EntityFluxOCIRepositoriesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxOCIRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxOCIRepositoriesCard').then(
          m => m.EntityFluxOCIRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux HelmRepositories for an Entity.
 * @public
 */
export const EntityFluxHelmRepositoriesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxHelmRepositoriesCard').then(
          m => m.EntityFluxHelmRepositoriesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Kustomizations for an Entity.
 * @public
 */
export const EntityFluxKustomizationsCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxHelmRepositoriesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxKustomizationsCard').then(
          m => m.EntityFluxKustomizationsCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Kustomizations for an Entity.
 * @public
 */
export const EntityFluxDeploymentsCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxDeploymentsCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxDeploymentsCard').then(
          m => m.EntityFluxDeploymentsCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Sources for an Entity.
 * @public
 */
export const EntityFluxSourcesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxSourcesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxSourcesCard').then(
          m => m.EntityFluxSourcesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Image Policies for an Entity.
 * @public
 */
export const EntityFluxImagePoliciesCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'EntityFluxImagePoliciesCard',
    component: {
      lazy: () =>
        import('./components/EntityFluxImagePoliciesCard').then(
          m => m.EntityFluxImagePoliciesCard,
        ),
    },
  }),
);

/**
 * Card used to show the state of Flux Runtime.
 * @public
 */
export const FluxRuntimeCard = fluxPlugin.provide(
  createComponentExtension({
    name: 'FluxRuntimeCard',
    component: {
      lazy: () =>
        import('./components/FluxRuntimeCard').then(m => m.FluxRuntimeCard),
    },
  }),
);

/**
 * Page used to show Flux Controllers / Deployments in Flux Runtime
 * @public
 */
export const FluxRuntimePage = fluxPlugin.provide(
  createRoutableExtension({
    name: 'FluxRuntimePage',
    component: () =>
      import('./components/FluxRuntimePage').then(m => m.FluxRuntimePage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Export for Flux Icon to use in nav
 * @public
 */
export const FluxIcon = fluxPlugin.provide(
  createComponentExtension({
    name: 'FluxIcon',
    component: {
      lazy: () => import('./images/icons').then(m => m.FluxIcon),
    },
  }),
);
