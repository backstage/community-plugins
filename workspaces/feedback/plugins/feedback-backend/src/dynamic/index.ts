import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { feedbackPlugin } from '../plugin';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => feedbackPlugin(),
};
