import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { ScaffolderRelationEntityProcessor } from '../ScaffolderRelationEntityProcessor';

/**
 * 
 * @public
 */
export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  async catalog(builder) {
    builder.addProcessor(new ScaffolderRelationEntityProcessor());
  },
};
