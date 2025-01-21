# Usage

## Enable npm cards for a catalog entity

To enable the different npm cards you must add the `npm/package` annotation
with the name of the npm package:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: react
```

## Use other npm tag then `latest`

The "npm info" card shows the information of the latest 'stable' npm release
and use the common `latest` tag by default. This could be changed with `npm/stable-tag`:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: react
    npm/stable-tag: latest, stable, next, etc.
```

## Use a custom registry

To use another npm registry you need to specific a registry name in your
catalog entity that exists in your `app-config.yaml`.

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: another-package
    npm/registry: github
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: github
      url: https://npm.pkg.github.com
      token: ghp_...
```

For more informations and scenarios see [Registries](./registries.md).
