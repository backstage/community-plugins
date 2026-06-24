import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isNexusRepositoryManagerExperimentalAvailable } from '../plugin';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const nexusRepositoryManagerEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/build-artifacts',
    title: 'Build Artifacts',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    filter: isNexusRepositoryManagerExperimentalAvailable,
    loader: async () =>
      import('../components').then(m =>
        compatWrapper(<m.NexusRepositoryManager />),
      ),
  },
});
