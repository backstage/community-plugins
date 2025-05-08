# Setting up the development environment for Kubernetes action

1. Add the local package dependency to the Backstage instance

   ```shell
   yarn workspace backend add file:./plugins/kubernetes-actions
   ```

2. [Register](./README.md#configuration) the Kubernetes actions in your Backstage project
3. **Optional**: You can use the sample template from this repository and add it as `locations` in your `app-config.yaml` file

   ```yaml
   ---
   catalog:
     locations:
       - type: file
         target: ../../plugins/kubernetes-actions/examples/templates/01-kubernetes-template.yaml
         rules:
           - allow: [Template]
   ```

4. Run `yarn start`
5. Make sure you have an available kubernetes cluster
6. Start using the Kubernetes actions in your templates
