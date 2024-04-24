import { createBackendModule } from '@backstage/backend-plugin-api';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  DefaultPlaylistPermissionPolicy,
  isPlaylistPermission,
} from '@backstage-community/plugin-playlist-backend';

class DefaultPermissionPolicy implements PermissionPolicy {
  private playlistPermissionPolicy = new DefaultPlaylistPermissionPolicy();

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    if (isPlaylistPermission(request.permission)) {
      return this.playlistPermissionPolicy.handle(request, user);
    }

    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'defaultPolicy',
  register(env) {
    env.registerInit({
      deps: {
        policy: policyExtensionPoint,
      },
      async init({ policy }) {
        policy.setPolicy(new DefaultPermissionPolicy());
      },
    });
  },
});
