# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

## How to run

When it comes to starting the Jenkins plugin, you can either start the frontend and backend plugin in standalone mode or
spin up a rich development environment which starts a full Backstage app where the Jenkins plugins are installed. In
both cases, you'll want to configure Jenkins credentials so that you can connect to an actual instance:

- Create an `app-config.local.yaml` in this directory
- Configure your Jenkins instance as described in
  the [backend plugin docs](./plugins/jenkins-backend/README.md#DefaultJenkinsInfoProvider)

### Standalone mode

- Navigate to the directory of the plugin you want to run (either `cd plugins/jenkins` or `cd plugins/jenkins-backend`)
- Run `yarn install`
- Run `yarn start`

### Rich mode

- Adjust the `'jenkins.io/job-full-name'` annotation in the [catalog-info.yaml](./examples/entities.yaml#16) to point to your
  Jenkins job
- Run `yarn install`
- Run `yarn start`
