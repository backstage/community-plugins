import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { MTAProvider } from '../provider/MTAEntityProvider';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  async catalog(builder, env) {
    builder.addEntityProvider(
      MTAProvider.newProvider(env.config, env.logger, env.scheduler),
    );
  },
};
