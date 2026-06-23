# Keycloak auth backend module for Backstage

The `auth-backend-module-keycloak` enables [Keycloak](https://www.keycloak.org/) authentication for Backstage, allowing users to sign in with their Keycloak credentials.

For an enhanced experience, we recommend using this module alongside the @backstage-community/plugin-catalog-backend-module-keycloak plugin. This setup allows for the synchronization of Keycloak users and groups, ensuring sign-in resolvers can locate the corresponding User entities.

**Contributors:** see [CONTRIBUTING.md](./CONTRIBUTING.md) for the local Keycloak + auth harness flow, browserless OAuth login smoke (`login.py`), and bump-review guidance.

## Capabilities

- Authentication via the Keycloak OpenID Connect `authorization_code` flow.
- Automatic discovery of the Keycloak issuer (`/.well-known/openid-configuration`).
- Refresh token support, including Keycloak's default refresh-token rotation.
- Sign-in resolvers (configure under `auth.providers.keycloak.<env>.signIn.resolvers`):
  - `emailMatchingUserEntityProfileEmail`
  - `emailLocalPartMatchingUserEntityName`
  - `preferredUsernameMatchingUserEntityName`
  - `oidcSubClaimMatchingKeycloakUserId` — match catalog users by `keycloak.org/id` using the OIDC `sub` claim
  - `ldapUuidMatchingAnnotation` — match catalog users by `backstage.io/ldap-uuid`; the LDAP id claim must match in userinfo and the ID token
- Configurable `additionalScopes` (e.g. `offline_access`, `roles`).
- RP-initiated Single Logout: revokes the refresh token at Keycloak and returns the Keycloak
  `end_session_endpoint` URL so the browser terminates the Keycloak SSO session.

## For administrators

### Prerequisites

- A running Keycloak instance reachable from the Backstage backend.
- A realm in which Backstage users exist.
- Administrator access to create a Keycloak client.

### Create a client on Keycloak

1. In the Keycloak admin console, open the realm you want Backstage to authenticate against.
2. Navigate to **Clients** and click **Create client**.
3. Fill out the **General settings** form:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `backstage` (or a name of your choice)
4. In **Capability config**:
   - Enable **Client authentication**. This makes the client _confidential_, which is required because the
     module uses the `client_secret` for the token exchange.
   - Keep **Standard flow** enabled. Disable **Direct access grants** unless you need it.
5. In **Login settings**:
   - **Valid redirect URIs**: `http://localhost:7007/api/auth/keycloak/handler/frame`
   - **Valid post logout redirect URIs**: `http://localhost:7007`
   - **Web origins**: `http://localhost:3000` (or `+` to allow all valid redirect URIs).
6. Save the client, then open the **Credentials** tab and copy the generated **Client secret**.

For a production deployment, replace `http://localhost:7007` with the URL at which your Backstage backend is
served, and `http://localhost:3000` with the URL of the Backstage frontend.

### Installation

Install the package into your Backstage backend:

```bash
yarn workspace backend add @backstage-community/plugin-auth-backend-module-keycloak-provider
```

Register the plugin in the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

/* highlight-add-next-line */
backend.add(
  import('@backstage-community/plugin-auth-backend-module-keycloak-provider'),
);

backend.start();
```

### Configuration

Add the Keycloak provider to your `app-config.yaml` under `auth.providers`:

```yaml title="app-config.yaml"
auth:
  environment: development
  providers:
    keycloak:
      development:
        clientId: ${AUTH_KEYCLOAK_CLIENT_ID}
        clientSecret: ${AUTH_KEYCLOAK_CLIENT_SECRET}
        baseUrl: ${AUTH_KEYCLOAK_BASE_URL}
        realm: ${AUTH_KEYCLOAK_REALM}
        # Optional: scopes appended to the required `openid profile email` scopes.
        # additionalScopes:
        #   - offline_access
        #   - roles
        #
        # Optional: URL the browser is redirected to after Keycloak has
        #           terminated the SSO session. Must match a value registered under
        #           `Valid post logout redirect URIs` on the Keycloak client.
        # postLogoutRedirectUri: ${AUTH_KEYCLOAK_POST_LOGOUT_REDIRECT_URI}
        #
        # Optional: prompt parameter for the OIDC authorization request.
        #           For example, set to 'login' to force the user to manually enter
        #           their credentials even if an active session already exists.
        # prompt: "login"
        signIn:
          resolvers:
            # See "Sign-in resolvers" and "Match users by LDAP UUID" below.
            - resolver: preferredUsernameMatchingUserEntityName
            # - resolver: oidcSubClaimMatchingKeycloakUserId
            # - resolver: ldapUuidMatchingAnnotation
            #   ldapUuidKey: ldap_uuid # optional; default is ldap_uuid
            # Optional: Bypass the catalog check by enabling the `dangerouslyAllowSignInWithoutUserInCatalog` option.
            # - resolver: preferredUsernameMatchingUserEntityName
            #   dangerouslyAllowSignInWithoutUserInCatalog: true
```

The following table describes the parameters that can be configured under
`auth.providers.keycloak.<ENVIRONMENT_NAME>`:

| Name                    | Description                                                                                                                                                                                                                                                   | Default | Required |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `clientId`              | The client ID registered for Backstage in the Keycloak realm.                                                                                                                                                                                                 | -       | Yes      |
| `clientSecret`          | The client secret for the Keycloak client.                                                                                                                                                                                                                    | -       | Yes      |
| `baseUrl`               | Base URL of the Keycloak server, without a trailing `/realms/...` path (e.g. `https://kc.x`).                                                                                                                                                                 | -       | Yes      |
| `realm`                 | Name of the Keycloak realm that Backstage authenticates against.                                                                                                                                                                                              | -       | Yes      |
| `additionalScopes`      | Scopes appended to the required `openid profile email` scopes.                                                                                                                                                                                                | `[]`    | No       |
| `postLogoutRedirectUri` | URL the browser is redirected to after the Keycloak session has been terminated. Must match a registered `Valid post logout redirect URI`.                                                                                                                    | -       | No       |
| `prompt`                | Value of the OIDC `prompt` parameter forwarded to Keycloak on every authorization request (e.g. `login` to force credential entry, `none` for silent re-authentication). When omitted, no `prompt` parameter is sent and Keycloak's default behavior applies. | -       | No       |

> **Note**
>
> The Keycloak provider does not accept a dedicated `scope` configuration option. Use
> `additionalScopes` instead; the final scope is composed by the framework from the client-requested
> scope, the required `openid profile email` scopes, and `additionalScopes`.

### Restricting the access token audience

Keycloak does not support a dedicated `audience` parameter in standard OpenID Connect authorization requests; therefore, this module does not expose one. To customize or restrict the `aud` claim in access tokens received by Backstage, you must configure a **Client Scope** and an **Audience Protocol Mapper** within Keycloak:

1.  In the Keycloak admin console, select your realm and navigate to **Client scopes** &rarr; **Create client scope**. Provide a name (e.g., `backstage-audience`) and set the **Type** to `Default` to ensure it is included in every token issued for the associated client.
2.  Open the newly created client scope, go to the **Mappers** tab, and select **Configure a new mapper** &rarr; **Audience**.
3.  In the configuration form, set the **Included Client Audience** (or **Included Custom Audience** for a static string) to your desired audience value. Ensure **Add to access token** is toggled to **On**.
4.  Navigate to **Clients** and select your Backstage client. Switch to the **Client scopes** tab, click **Add client scope**, select the scope you created in step 1 (e.g., `backstage-audience`), and click **Add** choosing **Default** as the assignment type.

Once configured, every access token issued for the Backstage client will contain the specified audience in its `aud` claim, requiring no additional parameters from this module.

For detailed instructions, refer to the official Keycloak documentation on [client scopes](https://www.keycloak.org/docs/latest/server_admin/index.html#_client_scopes) and [audience support](https://www.keycloak.org/docs/latest/server_admin/index.html#audience-support).

### Sign-in resolvers

This module ships the following resolvers for `signIn.resolvers` (see also
[Identity resolver](https://backstage.io/docs/auth/identity-resolver) in the Backstage docs):

**Shared / email / username**

- `emailMatchingUserEntityProfileEmail`: matches the Keycloak `email` claim with a Catalog `User` entity that
  has the same `spec.profile.email`. Throws `NotFoundError` when no entity matches.
- `emailLocalPartMatchingUserEntityName`: matches the
  [local part](https://en.wikipedia.org/wiki/Email_address#Local-part) of the Keycloak `email` claim with a
  Catalog `User` entity whose `metadata.name` is equal to that local part.
- `preferredUsernameMatchingUserEntityName`: matches the Keycloak `preferred_username` claim with a Catalog
  `User` entity whose `metadata.name` is equal to that username (after the same sanitization as the Keycloak
  catalog plugin). Throws when the profile does not contain a `preferred_username`.

**Keycloak-specific**

- `oidcSubClaimMatchingKeycloakUserId`: matches the OIDC `sub` from userinfo (cross-checked against the ID
  token) to the `keycloak.org/id` annotation. Use with the Keycloak catalog module so users carry that
  annotation.

**LDAP UUID (LDAP user federation)**

- `ldapUuidMatchingAnnotation`: matches a claim from userinfo to the `backstage.io/ldap-uuid` annotation. The
  same claim must appear on the ID token with the same value. Values are checked as UUID strings.

Optional factory options:

- `dangerouslyAllowSignInWithoutUserInCatalog` (where supported): allow issuing a session when no catalog user
  matches (discouraged in production).
- `ldapUuidKey` (LDAP UUID resolvers only): claim name for the directory UUID; default `ldap_uuid`.

If none of the provided resolvers fits your needs, follow the
[Building Custom Resolvers](https://backstage.io/docs/auth/identity-resolver#building-custom-resolvers) guide
in the Backstage documentation.

### Match users by LDAP UUID (Keycloak)

Use this when Keycloak federates users from LDAP and catalog `User` entities carry `backstage.io/ldap-uuid`
(from [`@backstage/plugin-catalog-backend-module-ldap`](https://backstage.io/docs/integrations/ldap/introduction)).

You need:

1. Catalog users with the `backstage.io/ldap-uuid` annotation provided by the `@backstage/plugin-catalog-backend-module-ldap` catalog provider.
2. A Keycloak **client scope** and **mapper** that copies the LDAP unique id into a token claim (default
   name `ldap_uuid`) on **both** the ID token and userinfo.
3. `signIn.resolvers` with `ldapUuidMatchingAnnotation`, and `ldapUuidKey` if you use a claim name other than
   `ldap_uuid`.

#### Keycloak: client scope and mapper

1. **Client scopes** → **Create client scope** (for example `ldap_uuid`).
2. On that scope → **Mappers** → **User Attribute** or **LDAP Attribute** mapper (depends on your Keycloak
   version). Example fields:
   - **User Attribute**: the attribute that stores the LDAP unique id in Keycloak.
   - **Token Claim Name**: `ldap_uuid` (or your chosen name; set `ldapUuidKey` in `app-config` to match).
   - **Claim JSON Type**: `String`
   - **Add to ID token** and **Add to userinfo**: on
3. **Clients** → your Backstage client → **Client scopes** → add the scope as **Default** (or **Optional**).

This module reads userinfo from Keycloak and checks the ID token from the token response, so the mapper must
emit the claim in both places.

#### Optional scope on the OAuth request

If the scope is **Optional** on the client, request it with `additionalScopes`:

```yaml
additionalScopes:
  - ldap_uuid
```

#### Backstage: `app-config.yaml`

```yaml
auth:
  providers:
    keycloak:
      development:
        clientId: ${AUTH_KEYCLOAK_CLIENT_ID}
        clientSecret: ${AUTH_KEYCLOAK_CLIENT_SECRET}
        baseUrl: ${AUTH_KEYCLOAK_BASE_URL}
        realm: ${AUTH_KEYCLOAK_REALM}
        signIn:
          resolvers:
            - resolver: ldapUuidMatchingAnnotation
              ldapUuidKey: ldap_uuid # optional; default is ldap_uuid
```

In production, prefer a **single** sign-in resolver (or a small ordered list you understand) so identity
matching stays clear.

Restart the Backstage backend after changing Keycloak or `app-config`.

### Integrating with the Keycloak catalog provider

The sign-in resolvers rely on a matching `User` entity already existing in the Backstage catalog. The
recommended way to achieve this is to deploy the companion plugin
[`@backstage-community/plugin-catalog-backend-module-keycloak`](../catalog-backend-module-keycloak), which
synchronises Keycloak users and groups into the catalog on a schedule.

When using that plugin, `preferredUsernameMatchingUserEntityName` is usually the most straightforward
resolver because the catalog User entity names are generated from the Keycloak username by default. For
LDAP-federated identities where the catalog stores `backstage.io/ldap-uuid`, use
`ldapUuidMatchingAnnotation` instead (see **Match users by LDAP UUID**).

### Adding the provider to the Backstage frontend

The `SignInPage` on the frontend needs to know how to render a button for the Keycloak provider. Follow the
generic instructions in
[Sign-In Configuration](https://backstage.io/docs/auth/#sign-in-configuration) and register a Keycloak OAuth
API reference in your frontend. A minimal example using the core sign-in page looks like:

```tsx title="packages/app/src/App.tsx"
import {
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  configApiRef,
  createApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
} from '@backstage/frontend-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

// Define the API Reference
const keycloakAuthApiRef = createApiRef<
  OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
>({
  id: 'auth.keycloak',
});

// Create the API Implementation Blueprint
const keycloakAuthApi = ApiBlueprint.make({
  name: 'keycloak',
  params: defineParams =>
    defineParams({
      api: keycloakAuthApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        oauthRequestApi: oauthRequestApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
        OAuth2.create({
          configApi,
          discoveryApi,
          oauthRequestApi,
          environment: configApi.getOptionalString('auth.environment'),
          provider: {
            id: 'keycloak',
            title: 'Keycloak',
            icon: () => null,
          },
          defaultScopes: ['openid', 'profile', 'email'],
        }),
    }),
});

// Configure the Sign-In Page
const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
        <SignInPage
          {...props}
          provider={{
            id: 'keycloak-auth-provider',
            title: 'Keycloak',
            message: 'Sign in using Keycloak',
            apiRef: keycloakAuthApiRef,
          }}
        />
      ),
  },
});

// Register in the App
export default createApp({
  features: [
    catalogPlugin,
    navModule,
    createFrontendModule({
      pluginId: 'app',
      extensions: [keycloakAuthApi, signInPage],
    }),
  ],
});
```

For more details on the new frontend system and how APIs are handled, please refer to the [official Backstage documentation](https://backstage.io/docs/frontend-system/building-apps/migrating/#apis).

### Sign-out behaviour

When a user signs out of Backstage, the framework clears the Backstage session cookie and invokes the
Keycloak authenticator's `logout` hook. The hook performs two steps:

1. The refresh token is revoked at Keycloak's `revocation_endpoint` on a best-effort basis so that it cannot
   be replayed even if the browser redirect is interrupted.
2. The framework returns Keycloak's `end_session_endpoint` URL to the frontend, which redirects the browser
   there to terminate the Keycloak SSO session (RP-initiated logout).

If you configure `postLogoutRedirectUri`, Keycloak will redirect the user back to that URL after the SSO
session has ended; the URL must be registered under **Valid post logout redirect URIs** on the Keycloak
client. When the option is omitted, Keycloak renders its own post-logout page. The Backstage framework only
forwards the URL when it uses `https` (or `localhost` for local development), so make sure your `baseUrl` is
served over TLS in non-local environments.

## Limitations

- **Issuer discovery is performed once per backend start.** If the Keycloak server is unreachable at startup,
  the plugin stays unavailable until the Backstage backend is restarted.
- **User attributes for sign-in come primarily from `userinfo`.** The module still obtains the **ID token**
  string from the token response so resolvers such as `oidcSubClaimMatchingKeycloakUserId` and
  `ldapUuidMatchingAnnotation` can cross-check claims against the ID token (see implementation in
  `src/resolvers.ts`). CSRF is enforced by the Backstage auth framework via the nonce cookie, and the ID
  token `nonce` claim is additionally validated against the nonce embedded in the OAuth state for replay
  protection.
- **Self-signed certificates.** If your Keycloak server presents a certificate that the Node runtime does
  not trust, set `NODE_EXTRA_CA_CERTS` to point at your CA bundle. Setting `NODE_TLS_REJECT_UNAUTHORIZED=0`
  disables all TLS validation and is strongly discouraged outside local development.
