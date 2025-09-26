import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { catalogModuleMtaEntityProvider } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => [catalogModuleMtaEntityProvider],
};
