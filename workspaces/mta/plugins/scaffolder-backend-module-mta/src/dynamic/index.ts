import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { mtaScaffolderModule } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => [mtaScaffolderModule],
};
