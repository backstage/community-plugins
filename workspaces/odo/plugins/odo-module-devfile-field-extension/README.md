# devfile-field-extension

This plugin is a Custom Field Extension for Backstage. It allows you to add a set of drop-down lists to pick a Devfile Stack version, a version, and a starter project.
It interacts with the configured [Devfile registry](https://registry.devfile.io/viewer) to load the list of available Devfile Stacks.

## Preview

![Devfile Custom Field Extension Preview](https://github.com/rm3l/backstage-odo-devfile-plugin/assets/593208/e7fcc998-dc87-4603-977b-76f510fed3aa)

## Installation

From your Backstage instance root folder:

```shell
yarn add --cwd packages/app @backstage-community/plugin-odo-module-devfile-field-extension
```

## Configuration

1. Add the import to your `packages/app/src/App.tsx` on the frontend package of your Backstage instance:

    ```tsx
    // packages/app/src/App.tsx

    import { DevfileSelectorFieldExtension } from '@backstage-community/plugin-odo-module-devfile-field-extension';
    import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
    ```

2. Then add the imported field extension as a child of `ScaffolderFieldExtensions` inside `Route`, like so:

    ```tsx
    // packages/app/src/App.tsx

    <Route path="/create" element={<ScaffolderPage />}>
      <ScaffolderFieldExtensions>
        <DevfileSelectorFieldExtension />
      </ScaffolderFieldExtensions>
    </Route>
    ```

3. This custom field extension populates the dropdown lists from a Devfile Registry, which is expected to be proxied by Backstage at the following path: `/devfile-registry`. As such, you need to add the appropriate configuration to your `app-config.yaml` file under the `proxy.endpoints` field, like so:

    ```yaml
    # app-config.yaml

    proxy:
      endpoints:
        '/devfile-registry':
          target: 'https://registry.devfile.io'
    ```

You should now see the custom field `DevfileSelectorExtension` and its dropdown lists populated if you navigate to the Template Editor page at <http://localhost:3000/create/edit>.

## Usage

To use the extension in a Backstage Software Template, you can add the `ui:field` field to the parameter. The output of the extension is an object made up of the following fields:
- `devfile`: the Devfile Stack selected by the user.
- `version`: the Devfile Stack version selected by the user
- `starter_project`: the Devfile Starter Project selected by the user. Optional.

```yaml
parameters:
    - title: Provide details about the Devfile
      required:
        - devfile_data
      properties:
        devfile_data:
          type: object
          required:
            - devfile
            - version
          properties:
            devfile:
              type: string
            version:
              type: string
            starter_project:
              type: string
          ui:field: DevfileSelectorExtension
          ui:autofocus: true
          ui:options:
            rows: 5
```

See <https://github.com/ododev/odo-backstage-software-template> for an example of a [Software Template](https://backstage.io/docs/features/software-templates/) making use of the Devfile Selector Field Extension.
