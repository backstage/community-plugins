import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { stringifyEntityRef } from '@backstage/catalog-model';

/**
 * Custom OIDC sign-in resolver that allows any user to sign in
 * using their Keycloak username/sub claim (doesn't require email).
 */
export const authModuleOidcSignIn = createBackendModule({
  pluginId: 'auth',
  moduleId: 'oidc-mta-signin',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        providers: authProvidersExtensionPoint,
      },
      async init({ logger, providers }) {
        logger.info('Registering custom OIDC MTA sign-in resolver');

        providers.registerProvider({
          providerId: 'oidc',
          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,
            async signInResolver(info, ctx) {
              const { profile, result } = info;

              // Try to get a unique identifier from the profile
              // Keycloak provides: sub, preferred_username, email (if set)
              const userId =
                profile.email?.split('@')[0] ||
                (result.fullProfile as any)?.preferred_username ||
                (result.fullProfile as any)?.sub ||
                profile.displayName?.toLowerCase().replace(/\s+/g, '-') ||
                'mta-user';

              logger.info(
                `OIDC sign-in: Creating identity for user "${userId}"`,
              );
              logger.debug(`Profile: ${JSON.stringify(profile)}`);
              logger.debug(
                `Full profile claims: ${JSON.stringify(result.fullProfile)}`,
              );

              // Issue a token for this user
              return ctx.issueToken({
                claims: {
                  sub: stringifyEntityRef({
                    kind: 'User',
                    namespace: 'default',
                    name: userId,
                  }),
                  ent: [
                    stringifyEntityRef({
                      kind: 'User',
                      namespace: 'default',
                      name: userId,
                    }),
                  ],
                },
              });
            },
          }),
        });
      },
    });
  },
});
