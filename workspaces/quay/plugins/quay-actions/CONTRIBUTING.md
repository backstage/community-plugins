# Setting up the development environment for Quay actions

1. Add the local package dependency to the Backstage instance

   ```shell
   yarn workspace backend add file:./plugins/quay-actions
   ```

2. [Register](./README.md#configuration) the Quay actions in your Backstage project
3. **Optional**: You can use the sample template from this repository and add it as `locations` in your `app-config.yaml` file

   ```yaml
   ---
   catalog:
     locations:
       - type: file
         target: ../../plugins/quay-actions/examples/templates/01-quay-template.yaml
         rules:
           - allow: [Template]
   ```

4. Run `yarn dev`
5. If you don't have a Quay account created yet you can create one for free on the [quay](https://quay.io) website
6. Start using the Quay actions in your templates
