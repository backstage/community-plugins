import { createExtensionPoint } from '@backstage/backend-plugin-api';
import type { ExploreToolProvider } from './types';

/**
 * @public
 */
export interface ToolProviderExtensionPoint {
  setToolProvider(provider: ExploreToolProvider): void;
}

/**
 * Extension point which allows to set the ToolProvider to be used, which will serve as source of tools
 * @public
 */
export const toolProviderExtensionPoint =
  createExtensionPoint<ToolProviderExtensionPoint>({
    id: 'explore.tool-provider',
  });
