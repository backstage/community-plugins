# Jenkins Plugin (Alpha)

Welcome to the Jenkins backend plugin! Website: [https://jenkins.io/](https://jenkins.io/)

This is the backend half of the 2 Jenkins plugins and is responsible for:

- finding an appropriate instance of Jenkins for an entity
- finding the appropriate job(s) on that instance for an entity
- connecting to Jenkins and gathering data to present to the frontend

## New Backend System

The jenkins backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
  backend.add(import('@backstage-community/plugin-jenkins-backend'));
  backend.start();
```

## Integrating into a backstage instance

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-jenkins-backend
```

Typically, this means creating a `src/plugins/jenkins.ts` file and adding a reference to it to `src/index.ts`

### jenkins.ts

```typescript
import {
  createRouter,
  DefaultJenkinsInfoProvider,
} from '@backstage-community/plugin-jenkins-backend';
import { CatalogClient } from '@backstage/catalog-client';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalog = new CatalogClient({
    discoveryApi: env.discovery,
  });

  return await createRouter({
    logger: env.logger,
    jenkinsInfoProvider: DefaultJenkinsInfoProvider.fromConfig({
      config: env.config,
      catalog,
    }),
    permissions: env.permissions,
  });
}
```

### src/index.ts

```diff
diff --git a/packages/backend/src/index.ts b/packages/backend/src/index.ts
index f2b14b2..2c64f47 100644
--- a/packages/backend/src/index.ts
+++ b/packages/backend/src/index.ts
@@ -22,6 +22,7 @@ import { Config } from '@backstage/config';
 import app from './plugins/app';
+import jenkins from './plugins/jenkins';
 import scaffolder from './plugins/scaffolder';
@@ -56,6 +57,7 @@ async function main() {
   const authEnv = useHotMemoize(module, () => createEnv('auth'));
+  const jenkinsEnv = useHotMemoize(module, () => createEnv('jenkins'));
   const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
@@ -63,6 +65,7 @@ async function main() {

   const apiRouter = Router();
   apiRouter.use('/catalog', await catalog(catalogEnv));
+  apiRouter.use('/jenkins', await jenkins(jenkinsEnv));
   apiRouter.use('/scaffolder', await scaffolder(scaffolderEnv));
```

This plugin must be provided with a JenkinsInfoProvider, this is a strategy object for finding the Jenkins instance and job(s) for an entity.

There is a standard one provided, but the Integrator is free to build their own.

### DefaultJenkinsInfoProvider

Allows configuration of either a single or multiple global Jenkins instances and annotating entities with the job name(s) on that instance (and optionally the name of the instance).

#### Example - Single global instance

The following will look for jobs for this entity at `https://jenkins.example.com/job/teamA/job/artistLookup-build`

Config

```yaml
jenkins:
  baseUrl: https://jenkins.example.com
  username: backstage-bot
  projectCountLimit: 100
  apiKey: 123456789abcdef0123456789abcedf012
  # optionally add extra headers
  # extraRequestHeaders:
  #   extra-header: my-value
```

Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  annotations:
    'jenkins.io/job-full-name': teamA/artistLookup-build
```

The `projectCountLimit` is optional and if not set, the default limit is 50.
The old annotation name of `jenkins.io/github-folder` is equivalent to `jenkins.io/job-full-name`

#### Example - Multiple global instances

The following will look for jobs for this entity at `https://jenkins-foo.example.com/job/teamA/job/artistLookup-build`

Config

```yaml
jenkins:
  instances:
    - name: default
      baseUrl: https://jenkins.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
    - name: departmentFoo
      baseUrl: https://jenkins-foo.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
```

Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  annotations:
    'jenkins.io/job-full-name': departmentFoo:teamA/artistLookup-build
```

If the `departmentFoo:` part is omitted, the default instance will be assumed.

The following config is an equivalent (but less clear) version of the above:

```yaml
jenkins:
  baseUrl: https://jenkins.example.com
  username: backstage-bot
  apiKey: 123456789abcdef0123456789abcedf012
  instances:
    - name: departmentFoo
      baseUrl: https://jenkins-foo.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
```

#### Example - Override Base Url from an Entity

The following will show you how to override a base url defined in the Config with a value from the Catalog. allowedBaseUrlOverrideRegex must be a regex string in the config, which will check if the sent in url matches that regex for override.

The check for the regex is to add a security check to make sure no malicious urls were sent to connect the plugin.

Config

```yaml
jenkins:
  instances:
    - name: departmentFoo
      baseUrl: https://departmentFoo.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
      allowedBaseUrlOverrideRegex: https://.*\.example\.com
```

Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  annotations:
    'jenkins.io/job-full-name': departmentFoo:teamA/artistLookup-build
    'jenkins.io/override-base-url': 'https://other.example.com'
```

This will set the instance's base url to 'https://other.example.com' when loading the configuration. It will verify first if the url
sent in is not null, along with the regex string list, and then compares the url to all regex strings to make sure one of them match.

This use case is for Jenkins systems where there are a lot of Jenkins instances configured from a base instance, which share the same API keys. Therefore a user does not have to define all of the instances here, but in the catalog for ease of use.

#### Example - Defining Multiple Jenkins Jobs for a Single instance

You can configure multiple Jenkins jobs for a **single** component by specifying multiple project names in the `jenkins.io/job-full-name` annotation.

This is useful when you want to track different types of jobs for the same component.

Config

```yaml
jenkins:
  instances:
    - name: default
      baseUrl: https://jenkins.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
    - name: departmentFoo
      baseUrl: https://jenkins-foo.example.com
      username: backstage-bot
      projectCountLimit: 100
      apiKey: 123456789abcdef0123456789abcedf012
```

Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  annotations:
    'jenkins.io/job-full-name': departmentFoo:teamA/artistLookup-build,departmentFoo:teamA/artistLookup-test
```

This configuration will track jobs at:

- `https://jenkins-foo.example.com/job/teamA/job/artistLookup-build`
- `https://jenkins-foo.example.com/job/teamA/job/artistLookup-test`

**Limitation:** Currently you cannot associate jobs from different Jenkins instances with the same component. All jobs must belong to the same Jenkins instance.

### Custom JenkinsInfoProvider

An example of a bespoke JenkinsInfoProvider which uses an organisation specific annotation to look up the Jenkins info (including jobFullName):

```typescript
class AcmeJenkinsInfoProvider implements JenkinsInfoProvider {
  constructor(private readonly catalog: CatalogClient) {}

  async getInstance(opt: {
    entityRef: EntityName;
    jobFullName?: string;
  }): Promise<JenkinsInfo> {
    const PAAS_ANNOTATION = 'acme.example.com/paas-project-name';

    // lookup pass-project-name from entity annotation
    const entity = await this.catalog.getEntityByRef(opt.entityRef);
    if (!entity) {
      throw new Error(
        `Couldn't find entity with name: ${stringifyEntityRef(opt.entityRef)}`,
      );
    }

    const paasProjectName = entity.metadata.annotations?.[PAAS_ANNOTATION];
    if (!paasProjectName) {
      throw new Error(
        `Couldn't find paas annotation (${PAAS_ANNOTATION}) on entity with name: ${stringifyEntityRef(
          opt.entityRef,
        )}`,
      );
    }

    // lookup department and team for paas project name
    const { team, dept } = this.lookupPaasInfo(paasProjectName);

    const baseUrl = `https://jenkins-${dept}.example.com/`;
    const jobFullName = `${team}/${paasProjectName}`;
    const username = 'backstage-bot';
    const projectCountLimit = 100;
    const apiKey = this.getJenkinsApiKey(paasProjectName);
    const creds = btoa(`${username}:${apiKey}`);

    return {
      baseUrl,
      headers: {
        Authorization: `Basic ${creds}`,
      },
      jobFullName,
    };
  }

  private lookupPaasInfo(_: string): { team: string; dept: string } {
    // Mock implementation, this would get info from the paas system somehow in reality.
    return {
      team: 'teamA',
      dept: 'DepartmentFoo',
    };
  }

  private getJenkinsApiKey(_: string): string {
    // Mock implementation, this would get info from the paas system somehow in reality.
    return '123456789abcdef0123456789abcedf012';
  }
}
```

No config would be needed if using this JenkinsInfoProvider

A Catalog entity of the following will look for jobs for this entity at `https://jenkins-departmentFoo.example.com/job/teamA/job/artistLookupService`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  annotations:
    'acme.example.com/paas-project-name': artistLookupService
```

## Jenkins' terminology notes

The domain model for Jenkins is not particularly clear but for the purposes of this plugin the following model has been assumed:

Jenkins contains a tree of *job*s which have children of either; other *job*s (making it a _folder_) or *build*s (making it a _project_).
Concepts like _pipeline_ and *view*s are meaningless (pipelines are just jobs for our purposes, views are (as the name suggests) just views of subsets of jobs)

A _job full name_ is a slash separated list of the names of the job, and the folders which contain it. For example `teamA/artistLookupService/develop`, and the same way that a filesystem path has folders and file names.
