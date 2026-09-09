# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

## How to run

The Jenkins workspace uses the plugin dev app as the primary testing mechanism. You can start the new frontend system (NFS) or the legacy frontend system. In both cases, you'll want to configure Jenkins credentials so that you can connect to an actual instance:

- Create an `app-config.local.yaml` in this directory
- Configure your Jenkins instance as described in
  the [backend plugin docs](./plugins/jenkins-backend/README.md#DefaultJenkinsInfoProvider)

### New frontend system (default)

- Run `yarn install`
- Run `yarn start`

This starts the NFS frontend plugin together with the Jenkins backend plugin.

### Legacy frontend system

- Adjust the `'jenkins.io/job-full-name'` annotation in the [catalog-info.yaml](./examples/entities.yaml#16) to point to your
  Jenkins job
- Run `yarn install`
- Run `yarn start:legacy`
