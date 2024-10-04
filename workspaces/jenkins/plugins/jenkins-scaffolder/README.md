# scaffolder-backend-module-jenkins

Welcome to the `scaffolder-backend-module-jenkins` custom action!

This contains one action: `jenkins:job:create`

The `jenkins:job:create` action creates a new job in Jenkins.

## Getting started

```
cd packages/backend
yarn add @ma11hewthomas/plugin-scaffolder-backend-module-jenkins
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts
---
import { ScmIntegrations } from '@backstage/integration';
import { jenkinsCreateJobAction } from '@ma11hewthomas/plugin-scaffolder-backend-module-jenkins';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const actions = [
    ...builtInActions,
    jenkinsCreateJobAction({
      config: env.config,
    }),
  ];

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    catalogClient: catalogClient,
    reader: env.reader,
    identity: env.identity,
    actions,
    scheduler: env.scheduler,
  });
}
```

### Authorization

In order to use `scaffolder-backend-module-jenkins`, you must provide a username and api key to allow access the Jenkins API (permission to create jobs is required)

You must define your jenkins username and api key in the `app-config.yaml`:

```yaml
scaffolder:
  jenkins:
    username: ${JENKINS_USERNAME}
    key: ${JENKINS_API_KEY}
    server: ${JENKINS_SERVER_URL}
```

### Example of using

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: debug-jenkins
  title: debug-jenkins
  description: Template for debugging
  tags:
    - debug
spec:
  owner: MatthewThomas
  type: debug
  steps:
    - id: template
      name: Jenkins create job
      action: jenkins:job:create
      input:
        configPath: /path/to/config.xml
        jobName: test-project-one
        folderName: test-folder
```

You can visit the `/create/actions` route in your Backstage application to find out more about the parameters this action accepts when it's installed to configure how you like.

This scaffolder requires the path to a Jenkins job config.xml file. config.xml is the format Jenkins uses to store the project in the file system, you can see examples of them in the Jenkins home directory, or by retrieving the XML configuration of existing jobs from /job/JOBNAME/config.xml.
