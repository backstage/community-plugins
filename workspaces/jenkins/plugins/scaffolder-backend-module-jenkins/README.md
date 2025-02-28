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

## Supported Action

| Action      | Description                   |
| ----------- | ----------------------------- |
| jenking:job:build   | Run a job            |
| jenking:job:copy    | Copy an existing job |
| jenkins:job:create  | Create a job         |
| jenkins:job:destroy | Destroy a job        |
| jenkins:job:disable | Disable a job        |
| jenkins:job:enable  | Enable a job         |

## How to use it

Below, there is an example for each action

- Build job

  **Action input parameters**

  | Action          | Description                                    |
  | --------------- | ---------------------------------------------- |
  | _jobName_       | Name of job                                    |
  | _jobParameters_ | optional job parameters (object) to execute it |

  **Template Step**

  ```yaml
  - id: jenkins-job-build
    name: Jenkins Job Build
    action: jenkins:job:build
    input:
      jobName: first-job
      jobParameters: some-value
  ```

- Copy job

  **Action input parameters**

  | Action          | Description        |
  | --------------- | ------------------ |
  | _sourceJobName_ | Name of source job |
  | _targetJobName_ | Name of target job |

  **Template Step**

  ```yaml
  - id: jenkins-job-copy
    name: Jenkins Job Copy
    action: jenkins:job:copy
    input:
      sourceJobName: source-job
      targetJobName: target-job
  ```

- Create job

  **Action input parameters**

  | Action       | Description                                                                                   |
  | ------------ | --------------------------------------------------------------------------------------------- |
  | _jobName_    | Name of job                                                                                   |
  | _jobXml_     | Jenkins xml to create job                                                                     |
  | _configPath_ | Jenkins xml file to create job, should be a file under ./job/config.xml under skeleton folder |
  | _folderName_ | Jenkins folder name, in this case the job will be create under this folder (Optional)         |

  ```yaml
  - id: jenkins-job-create
    name: Jenkins Job Create
    action: jenkins:job:create
    input:
      jobName: first-job
      jobXml: |
        <flow-definition plugin="workflow-job@1447.v559b_c710cd2e">
        ... Jenkins content XML, was omitted for semplicity
        </flow-definition>
  ```

  Or

  ```yaml
  - id: jenkins-job-create
    name: Jenkins Job Create
    action: jenkins:job:create
    input:
      jobName: first-job
      folderName: folder
      folderPath: config/job.xml
  ```

- Destroy job

  **Action input parameters**

  | Action    | Description |
  | --------- | ----------- |
  | _jobName_ | Name of job |

  ```yaml
  - id: jenkins-job-destroy
    name: Jenkins Job Destroy
    action: jenkins:job:destroy
    input:
      jobName: first-job
  ```

- Disable job

  **Action input parameters**

  | Action    | Description |
  | --------- | ----------- |
  | _jobName_ | Name of job |

  ```yaml
  - id: jenkins-job-disable
    name: Jenkins Job Disable
    action: jenkins:job:disable
    input:
      jobName: first-job
  ```

- Enable job

  **Action input parameters**

  | Action          | Description                                    |
  | --------------- | ---------------------------------------------- |
  | _jobName_       | Name of job                                    |
  | _jobParameters_ | optional job parameters (object) to execute it |

  ```yaml
  - id: jenkins-job-enable
    name: Jenkins Job Enable
    action: jenkins:job:enable
    input:
      jobName: first-job
  ```

**`NOTE: no output will be provided after action excution`**

## Useful Links

The jenkins client used is available here <https://github.com/silas/node-jenkins#readme>

Here the link to npm package <https://www.npmjs.com/package/@robertonav20/backstage-plugin-scaffolder-jenkins-actions>
