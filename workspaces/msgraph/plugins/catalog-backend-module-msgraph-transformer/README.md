# @internal/backstage-plugin-catalog-backend-module-msgraph-transformer

The default user transformer provided by the [MsGraph plugin](https://github.com/backstage/backstage/tree/918d273bbb843bd09bb6c80d22d87c257a7e5343/plugins/catalog-backend-module-msgraph#readme) does not ingest users who do not have an email included in their profile, preventing those users from signing in. This is an issue because email is not a mandatory field when creating an user and therefore not all users will have this field defined.

This module [customizes the entity provider](https://github.com/backstage/backstage/tree/918d273bbb843bd09bb6c80d22d87c257a7e5343/plugins/catalog-backend-module-msgraph#customize-the-processor-or-entity-provider) to allow users without an email to be ingested into the catalog by using `userPrincipalName` as the identifier, instead of email by default.

_This plugin was created through the Backstage CLI_
