# Setting up the development environment for SonarQube actions

1. Add the local package dependency to the Backstage instance

   ```console
   yarn workspace backend add file:./plugins/sonarqube-actions
   ```

2. [Register](./README.md#installation) the SonarQube actions in your Backstage project
3. **Optional**: You can use the sample templates from this repository and add them as `locations` of your `app-config.yaml` file

   ```yaml title="app-config.yaml"
   catalog:
     locations:
       - type: file
         target: ../../plugins/sonarqube-actions/examples/templates/01-sonar-template.yaml
         rules:
           - allow: [Template]
       - type: file
         target: ../../plugins/sonarqube-actions/examples/templates/02-sonar-template.yaml
         rules:
           - allow: [Template]
   ```

4. Run `yarn start`
5. If you don't have a SonarQube instance available for testing, you can use the official SonarQube [container image](https://hub.docker.com/_/sonarqube/) and run it with [Podman](https://podman.io/) or [Docker](https://docker.io/) or you can use the sample Docker compose file from the [documentation](https://docs.sonarqube.org/latest/setup-and-upgrade/install-the-server/#installing-sonarqube-from-the-docker-image)
6. :rocket: Start using the SonarQube actions in your templates
