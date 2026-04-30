# Auth Module: PingFederate Provider

This module provides a PingFederate auth provider implementation for `@backstage/plugin-auth-backend`.

The provider uses OIDC authentication and includes PingFederate-specific sign-in resolvers for matching users via LDAP UUID and Ping Identity user IDs.

> **Note:** This provider has only been tested with LDAP catalog provider (`@backstage/plugin-catalog-backend-module-ldap`). It has not been tested with the PingOne catalog provider (`@backstage-community/plugin-catalog-backend-module-pingidentity`), though it should work with appropriate resolver configuration.

## Installation

```bash
yarn add --cwd packages/backend @backstage-community/plugin-auth-backend-module-pingfederate-provider
```

## Configuration

> **Important:** You must configure at least one sign-in resolver. There is no default resolver - the `resolver` field is mandatory.

Add the following to your `app-config.yaml`:

```yaml
auth:
  environment: development
  providers:
    pingfederate:
      development:
        # Base URL of your PingFederate server (without the .well-known path)
        baseUrl: ${PINGFEDERATE_BASE_URL} # e.g., https://your-pingfederate-server.com
        clientId: ${PINGFEDERATE_CLIENT_ID}
        clientSecret: ${PINGFEDERATE_CLIENT_SECRET}
        signIn:
          resolvers:
            # Resolver is required - choose one that matches your catalog setup:

            # Option 1: Match LDAP UUID annotation
            - resolver: ldapUuidMatchingAnnotation
              ldapUuidKey: 'ldap_uuid' # optional, defaults to 'ldap_uuid'


            # Option 2: Match Ping Identity user ID annotation
            # - resolver: subClaimMatchingPingIdentityUserId

            # Option 3: Match email local part to user entity name
            # - resolver: emailLocalPartMatchingUserEntityName
```

### Optional Configuration

You can customize the provider behavior with additional configuration options:

```yaml
auth:
  providers:
    pingfederate:
      development:
        baseUrl: ${PINGFEDERATE_BASE_URL}
        clientId: ${PINGFEDERATE_CLIENT_ID}
        clientSecret: ${PINGFEDERATE_CLIENT_SECRET}

        # Optional: Request additional scopes beyond the default openid, profile, email
        additionalScopes:
          - offline_access
        # Or as a single string:
        # additionalScopes: offline_access

        # Optional: Control the authentication prompt behavior
        # 'none' (default) - SSO if session exists, 'login' - force login, 'auto' - let provider decide
        prompt: none

        # Optional: Override the callback URL if different from the default
        # callbackUrl: https://backstage.example.com/api/auth/pingfederate/handler/frame

        signIn:
          resolvers:
            - resolver: ldapUuidMatchingAnnotation
```

## Register the Provider

Add the following to your `packages/backend/src/index.ts`:

```typescript
const backend = createBackend();
backend.add(
  import(
    '@backstage-community/plugin-auth-backend-module-pingfederate-provider'
  ),
);
```

## Available Sign-In Resolvers

You must configure at least one resolver in your `app-config.yaml`. Choose the resolver that matches your catalog setup and identity provider configuration.

### PingFederate-Specific Resolvers

- **`ldapUuidMatchingAnnotation`** - Matches an LDAP UUID claim to the `backstage.io/ldap-uuid` annotation

  - Configuration options:
    - `ldapUuidKey` (optional, default: `'ldap_uuid'`) - The claim name containing the LDAP UUID
    - `dangerouslyAllowSignInWithoutUserInCatalog` (optional) - Allow sign-in even if user is not in catalog
  - Validates that the UUID in userinfo matches the UUID in the ID token
  - **Requires PingFederate LDAP UUID configuration** (see setup instructions below)

- **`subClaimMatchingPingIdentityUserId`** - Matches the `sub` claim to the `pingidentity.org/id` annotation
  - Configuration options:
    - `dangerouslyAllowSignInWithoutUserInCatalog` (optional) - Allow sign-in even if user is not in catalog
  - Best for PingOne catalog provider integration
  - Validates that the `sub` claim in userinfo matches the `sub` in the ID token

#### PingFederate Configuration for LDAP UUID Resolver

The `ldapUuidMatchingAnnotation` resolver requires PingFederate to be configured to expose the LDAP UUID attribute. Follow these steps:

**1. Configure Authentication Policy Contract**

1. Create a contract named `rhdh-contract`
2. Add Attribute Source: Link your LDAP Data Store to this contract
3. Set Search Filter: Use `sAMAccountName=${username}` (or appropriate filter for your LDAP)
4. Expose the LDAP UUID attribute under the Authentication Policy Contract Mapping
5. For Active Directory, add the UUID field called `objectGUID` (note: UUID attribute name varies by LDAP vendor)
6. Set Encoding type to `Hex` from the dropdown
7. Enter search filter as needed (e.g., `sAMAccountName=${username}`)

**2. Map UUID to Sub Claim**

Under Contract Fulfillment, map `sub` to the objectGUID from LDAP:

1. From Source dropdown, select `Expression`
2. Enter the following OGNL expression to format the LDAP UUID as expected by Backstage:

```java
#GUID = #this.get("ds.<ldap-data-source-id>.objectGUID").toString(),
#GUID.substring(6,8) + #GUID.substring(4,6) + #GUID.substring(2,4) + #GUID.substring(0,2) + "-" +
#GUID.substring(10,12) + #GUID.substring(8,10) + "-" +
#GUID.substring(14,16) + #GUID.substring(12,14) + "-" +
#GUID.substring(16,20) + "-" + #GUID.substring(20,32)
```

Replace `<ldap-data-source-id>` with your actual LDAP data source ID.

**3. Configure OAuth & OIDC Scopes**

1. Navigate to **System > OAuth Scopes**
2. Ensure `email` and `profile` are added as Common Scopes

**4. Bridge Contract to OIDC Policy**

Use the Access Token as a bridge to ensure the `sub` claim is delivered consistently:

1. **Access Token Mapping**: Create a mapping from `rhdh-contract` to your Access Token Manager. Map the `sub` field from the contract to the token.
2. **OIDC Policy Fulfillment**: In your OIDC Policy, fulfill the `sub` claim by selecting Access Token as the source and `sub` as the value.
3. **Enable Delivery**: In the OIDC Policy Attribute Contract, ensure the ID Token and UserInfo checkboxes are selected for the `sub` claim.

**5. (Optional) Expose UUID under `ldap_uuid` claim in UserInfo**

If you want the UUID available under a custom `ldap_uuid` claim in UserInfo (instead of the default `sub` claim):

1. Under **OIDC Policy Attribute Contract**:
   - Extend the contract with `ldap_uuid` under Attribute Contract
   - Under Contract Fulfillment, map `ldap_uuid` to the UUID value via Access Token

Then configure your Backstage auth to use:

```yaml
signIn:
  resolvers:
    - resolver: ldapUuidMatchingAnnotation
      ldapUuidKey: 'ldap_uuid' # Custom claim name
```

### Common Resolvers

- **`emailLocalPartMatchingUserEntityName`** - Matches the local part of the email to the user entity name
  - Configuration options:
    - `allowedDomains` (optional) - Restrict sign-in to specific email domains
    - `dangerouslyAllowSignInWithoutUserInCatalog` (optional) - Allow sign-in even if user is not in catalog
- **`emailMatchingUserEntityProfileEmail`** - Matches the email to the user entity's email
  - Configuration options:
    - `dangerouslyAllowSignInWithoutUserInCatalog` (optional) - Allow sign-in even if user is not in catalog

## Links

- [Repository](https://github.com/backstage/community-plugins/tree/main/workspaces/pingidentity/plugins/auth-backend-module-pingfederate-provider)
- [Backstage Project Homepage](https://backstage.io)
