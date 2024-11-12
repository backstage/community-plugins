# RBAC Providers

The RBAC plugins also has the ability to apply roles and permissions from third party access management tools through the use of the RBAC extension points. These extension points allow you to create a backend plugin module that connects your third part access management tool to the RBAC backend plugin. In this documentation, we will discuss how to create a simple RBAC backend module that will be used to apply roles and permissions.

## Getting started

Our first step is to create an RBAC backend module using the following command:

```bash
yarn new
```

This will start an interactive setup to create a new plugin. The following are what will need to be selected to create the new plugin module:

```bash
? What do you want to create? backend-module - A new backend module
? Enter the ID of the plugin [required] permission
? Enter the ID of the module [required] test
? Enter an owner to add to CODEOWNERS [optional]
```

This will then create a simple backend plugin module that is ready to updated based on your needs.

## Creating the Test Provider

Add the dependencies `@backstage-community/plugin-rbac-node` and `@backstage/config` to your newly created backend module using `yarn --cwd plugins/rbac-backend-module-test add @backstage-community/plugin-rbac-node @backstage/config`.

Add the test provider to the newly created plugin module `/plugins/rbac-backend-module-test/TestProvider.ts` and populate it with the following:

```ts
import { LoggerService } from '@backstage/backend-plugin-api';

import {
  RBACProvider,
  RBACProviderConnection,
} from '@backstage-community/plugin-rbac-node';

export class TestProvider implements RBACProvider {
  private readonly logger: LoggerService;
  private connection?: RBACProviderConnection;

  private constructor(logger: LoggerService) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });
  }

  // The name of the provider, used to distinguish between multiple providers
  getProviderName(): string {
    return `testProvider`;
  }

  // Used to connect the RBACProvider to the RBAC backend plugin
  async connect(connection: RBACProviderConnection): Promise<void> {}

  // Used to manually refresh the RBACProvider using an endpoint available in the RBAC backend plugin
  async refresh(): Promise<void> {}
}
```

Now, we will include a `run` method that will add a new role and permission to the RBAC backend plugin through the use of the extension points.

```ts
export class TestProvider implements RBACProvider {
  // Addition code above
  private async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const roles: string[][] = [
      ['user:default/tony', 'role:default/test-provider-role'],
    ];
    const permissions: string[][] = [
      ['role:default/test-provider-role', 'catalog-entity', 'read', 'allow'],
    ];

    await this.connection.applyRoles(roles);
    await this.connection.applyPermissions(permissions);
  }
}
```

Next, we will provider a scheduler option so that we can ensure our provider will be periodically synced. But first we want to include an option to read this schedule from the `app-config`.

```ts
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

// Additional imports above

export class TestProvider implements RBACProvider {
  private readonly logger: LoggerService;
  private connection?: RBACProviderConnection;

  private constructor(
    logger: LoggerService,
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
  ) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });
  }

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      schedule?: SchedulerServiceTaskRunner;
      scheduler?: SchedulerService;
    },
  ): TestProvider {
    const providerSchedule = readProviderConfig(config);
    let schedulerServiceTaskRunner;

    if (options.scheduler && providerSchedule) {
      schedulerServiceTaskRunner =
        options.scheduler.createScheduledTaskRunner(providerSchedule);
    } else if (options.schedule) {
      schedulerServiceTaskRunner = options.schedule;
    } else {
      throw new Error('Neither schedule nor scheduler is provided.');
    }

    return new TestProvider(options.logger, schedulerServiceTaskRunner);
  }
  // Additional code below
}

function readProviderConfig(
  config: Config,
): SchedulerServiceTaskScheduleDefinition | undefined {
  const rbacConfig = config.getOptionalConfig('permission.rbac.providers.test');
  if (!rbacConfig) {
    return undefined;
  }

  const schedule = rbacConfig.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        rbacConfig.getConfig('schedule'),
      )
    : undefined;

  return schedule;
}
```

We can then began to create our schedule function that will ensure we sync based on the schedule that is provider.

```ts
// Additional imports above
export class TestProvider implements RBACProvider {
  private readonly logger: LoggerService;
  private connection?: RBACProviderConnection;
  private readonly scheduleFn: () => Promise<void>;

  private constructor(
    logger: LoggerService,
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
  ) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFN(schedulerServiceTaskRunner);
  }

  // Additional code

  // Creates our schedule function that will periodically call our run method
  private createScheduleFN(
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
  ): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return schedulerServiceTaskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error: any) {
            this.logger.error(`Error occurred, here is the error ${error}`);
          }
        },
      });
    };
  }
}
```

After setting up the scheduler, we can supply the option to manually refresh the module.

```ts
// Additional imports above

export class TestProvider implements RBACProvider {
  // Addition code

  // Used to manually refresh the RBACProvider using an endpoint available in the RBAC backend plugin
  async refresh(): Promise<void> {
    try {
      await this.run();
    } catch (error: any) {
      this.logger.error(`Error occurred, here is the error ${error}`);
    }
  }
}
```

Finally, we just need to supply the logic for the connection.

```ts
// Additional imports above

export class TestProvider implements RBACProvider {
  // Addition code

  // Used to connect the RBACProvider to the RBAC backend plugin
  async connect(connection: RBACProviderConnection): Promise<void> {
    this.connection = connection;
    this.scheduleFn();
  }
}
```

## Updating the Module

Our final step is to update the dependencies that will be supplied and add the provider in `module.ts`.

```ts
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

import { rbacProviderExtensionPoint } from '@backstage-community/plugin-rbac-node';

import { TestProvider } from './TestProvider';

/**
 * The test backend module for the rbac plugin.
 *
 * @alpha
 */
export const rbacModuleTest = createBackendModule({
  pluginId: 'permission',
  moduleId: 'test',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rbac: rbacProviderExtensionPoint,
        scheduler: coreServices.scheduler,
        config: coreServices.rootConfig,
      },
      async init({ logger, rbac, scheduler, config }) {
        rbac.addRBACProvider(
          TestProvider.fromConfig(config, {
            logger,
            scheduler: scheduler,
            schedule: scheduler.createScheduledTaskRunner({
              frequency: { minutes: 30 },
              timeout: { minutes: 3 },
            }),
          }),
        );
      },
    });
  },
});
```

## Testing your newly created backend module

Install the provider and add it to `packages/backend/src/index.ts`.

```bash
yarn --cwd packages/app add @backstage-community/plugin-rbac-backend-module-test
```

```ts
backend.add(
  import('@backstage-community/plugin-rbac-backend-module-test/alpha'),
);
```

Configure the test provider in the `app-config`.

```yaml
permission:
  rbac:
    providers:
      test:
        schedule:
          frequency: { minutes: 1 }
          timeout: { minutes: 1 }
          initialDelay: { seconds: 1 }
```

This will set the provider schedule to apply the roles and permissions every minute.

Finally, to test the manual refresh capability update the config to adjust the frequency of the schedule.

```yaml
permission:
  rbac:
    providers:
      test:
        schedule:
          frequency: { minutes: 10 }
          timeout: { minutes: 1 }
          initialDelay: { seconds: 1 }
```

10 Minutes should give you enough time to manually trigger refresh.

Call the refresh endpoint.

```bash
curl -X POST "http://localhost:7007/api/permission/refresh/testProvider" -H "Authorization: Bearer $token" -v
```

Should return a 200.
