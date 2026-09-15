# Jenkins Plugin (Alpha)

Welcome to the Jenkins backend plugin! Website: [https://jenkins.io/](https://jenkins.io/)

This is the backend half of the 2 Jenkins plugins and is responsible for:

- finding the appropriate Jenkins instance or instances for an entity
- finding the appropriate job(s) on each instance for an entity
- connecting to Jenkins and gathering data to present to the frontend

## Integrating into a backstage instance

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-jenkins-backend
```

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
  backend.add(import('@backstage-community/plugin-jenkins-backend'));
  backend.start();
```

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

The override annotation contains one URL. When an entity references jobs from multiple instances, that URL is evaluated against every referenced instance's `allowedBaseUrlOverrideRegex`. Only use the override together with multiple instances when all matching instances are intentionally served from that URL.

#### Example - Defining Multiple Jenkins Jobs Across Instances

You can configure multiple Jenkins jobs for a **single** component by specifying comma-separated project names in the `jenkins.io/job-full-name` annotation. Each job may belong to a different configured Jenkins instance.

An unprefixed job belongs to the `default` instance. A prefixed job such as `departmentFoo:teamA/artistLookup-build` belongs only to the named instance. Jobs are identified by the pair `(instance name, job full name)`, so the same job full name may safely exist on more than one instance.

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
    - name: departmentBar
      baseUrl: https://jenkins-bar.example.com
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
    'jenkins.io/job-full-name': teamA/artistLookup-test,departmentFoo:teamA/artistLookup-build,departmentBar:teamA/artistLookup-build
```

This configuration will track jobs at:

- `https://jenkins.example.com/job/teamA/job/artistLookup-test`
- `https://jenkins-foo.example.com/job/teamA/job/artistLookup-build`
- `https://jenkins-bar.example.com/job/teamA/job/artistLookup-build`

The two `artistLookup-build` jobs above do not collide because their instance names are different. The frontend and backend preserve the instance name when opening build details, viewing run history, reading console output, or retrying a build.

If a request does not specify an instance, the provider uses the `default` instance. For backwards compatibility, an entity that references exactly one named instance also works without an explicit instance selector.

All referenced instances are queried in parallel. The current API does not return partial results: if one instance is unavailable, misconfigured, or lacks credentials for its annotated job, the projects request fails for the entity. The error identifies the failing instance and its job names. `projectCountLimit` continues to apply independently to each instance.

### Actions

The `jenkins:list-builds` action returns `instanceName` for every build. Pass that value to the optional `instanceName` input of `jenkins:get-build`, `jenkins:get-build-logs`, and `jenkins:trigger-build`. This is required to disambiguate jobs whose full names are equal across instances. Omitting it selects the entity's default instance.

### Custom JenkinsInfoProvider

An example of a bespoke JenkinsInfoProvider which uses an organisation specific annotation to look up the Jenkins info (including jobFullName):

```typescript
class AcmeJenkinsInfoProvider implements JenkinsInfoProvider {
  constructor(private readonly catalog: CatalogClient) {}

  async getInstance(opt: JenkinsInfoProviderOptions): Promise<JenkinsInfo> {
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
      instanceName: 'default',
      baseUrl,
      headers: {
        Authorization: `Basic ${creds}`,
      },
      fullJobNames: [jobFullName],
      projectCountLimit,
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

A custom provider that supports multiple instances should also implement the optional `getInstances` method and return one `JenkinsInfo` per instance. Existing custom providers that only implement `getInstance` remain supported and are treated as single-instance providers.

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
