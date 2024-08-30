import { OptimizationsApi } from '@backstage-community/plugin-redhat-resource-optimization-common';
import { createApiRef } from '@backstage/core-plugin-api';

export const optimizationsApiRef = createApiRef<OptimizationsApi>({
  id: 'plugin.redhat-resource-optimization.api',
});
