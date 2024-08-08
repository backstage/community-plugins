import type { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { resourceOptimizationPlugin } from './plugin';

/** @alpha */
export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => [resourceOptimizationPlugin()],
};
