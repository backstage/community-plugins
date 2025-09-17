# Registries

The npm plugin supports custom and private registries starting with v1.2.

## Default Configuration

The plugin loads information by default from https://registry.npmjs.com

This works without any additional configuration in your `app-config.yaml`
but only for public npm packages.

```yaml
npm:
  registries:
    - name: npmjs
      url: https://registry.npmjs.com
```

## Use an auth token for npmjs

To load information from another registry or to load information
from a private package, you must [install the backend](./install.md).

The catalog entity `npm/registry` annotation must be defined and match
one of the registries in the `app-config.yaml`:

Example:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: a-component
  annotations:
    npm/package: private-package
    npm/registry: npmjs
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: npmjs
      url: https://registry.npmjs.com
      token: ...
```

The `npm/registry: npmjs` annotation is required to use the npm backend.

Alternativly you can setup a default registry (also for npmjs):

```yaml
# app-config.yaml
npm:
  defaultRegistry: npmjs
```

## Use an alternative registry

Entity example:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: a-component
  annotations:
    npm/package: private-package
    npm/registry: private-registry
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: private-registry
      url: https://...
      token: ...
```

## Use GitHub npm registry

The GitHub npm registry requires also a GitHub token for public packages.

You need to create a token at https://github.com/settings/tokens

```yaml
# app-config.yaml
npm:
  registries:
    - name: github
      url: https://npm.pkg.github.com
      token: ghp_...
```

## Use GitLab npm registry

The GitLab npm registry might requires a token for private packages.

You need to create a token at https://github.com/settings/tokens

```yaml
# app-config.yaml
npm:
  registries:
    - name: gitlab
      url: https://gitlab.com/api/v4/packages/npm
      token: ...
```

Use `PRIVATE-TOKEN` header instead:

```yaml
# app-config.yaml
npm:
  registries:
    - name: gitlab-private
      url: https://gitlab.com/api/v4/packages/npm
      extraRequestHeaders:
        PRIVATE-TOKEN: ${NPM_PRIVATE_GITLAB_TOKEN} # glpat-...
```

## Other npm registries

Other npm registries should work the same way.

Please let us know if we should mention here another registry or
if you find any issue.

You can create a new [Issue on GitHub](https://github.com/backstage/community-plugins/issues/new?assignees=&labels=bug&projects=&template=1-bug.yaml&title=🐛+Npm%3A+<Title>)
