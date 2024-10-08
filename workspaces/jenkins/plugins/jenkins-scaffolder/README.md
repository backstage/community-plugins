# Scaffolder plugin for Jenkins

Welcome to the Jenkins Module for Scaffolder!

This contains one action: `jenkins:job:create`

The `jenkins:job:create` action creates a new job in Jenkins.

## New Backend System

The jenkins backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
  backend.add(import('@backstage-community/plugin-scaffolder-backend-module-jenkins'));
  backend.start();
```

### Authorization

In order to use the Jenkins Module for Scaffolder, you must provide a username and api key to allow access the Jenkins API (permission to create jobs is required)

You must define your jenkins username and api key in the `app-config.yaml`:

```yaml
jenkins:
  baseUrl: ${JENKINS_SERVER_URL}
  username: ${JENKINS_USERNAME}
  apiKey: ${JENKINS_API_KEY}
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
