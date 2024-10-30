# Setting up the development environment for Keycloak backend plugin

## Prerequisites

- Podman - required to stand up a Keycloak instance

You can run a development setup using the following command:

```console
yarn start
```

This will provision a new Keycloak instance locally via podman and import realm [`janus-realm`](./__fixtures__/keycloak-realm.json). This realm contains 1 group and 0 users (Keycloak currently doesn't support user export/import).

Once everything is started, you can access:

- Backstage catalog API at http://localhost:7007/catalog/entities
- Keycloak Admin UI at http://localhost:8080/admin/master/console/#/janus-realm
  - Username: `admin`
  - Password: `admin`
