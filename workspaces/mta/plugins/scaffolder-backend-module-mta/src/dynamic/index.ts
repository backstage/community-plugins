import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { createMTAApplicationAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: env => {
    return [createMTAApplicationAction(env)];
  },
};
