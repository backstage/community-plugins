import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import type { FilterPredicate } from '@backstage/filter-predicates';
import { rootRouteRef } from '../routes';
import { NEXUS_REPOSITORY_MANAGER_ANNOTATIONS } from '../annotations';

/**
 * @alpha
 */
export const nexusRepositoryManagerEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/build-artifacts',
    title: 'Build Artifacts',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    filter: {
      $any: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS.map(value => ({
        [`metadata.annotations.${value.annotation}`]: { $exists: true },
      })),
    } as FilterPredicate,
    loader: async () =>
      import('../components').then(m =>
        compatWrapper(<m.NexusRepositoryManager />),
      ),
  },
});
