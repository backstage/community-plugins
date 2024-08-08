import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { orchestratorPlugin } from '../OrchestratorPlugin';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => [orchestratorPlugin()],
};
