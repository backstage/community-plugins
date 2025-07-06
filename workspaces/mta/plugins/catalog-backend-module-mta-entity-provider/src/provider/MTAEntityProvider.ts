import { Config } from '@backstage/config';
import { Issuer, custom } from 'openid-client';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
//
/**
 * Provides entities from fictional frobs service.
 */
export class MTAProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private readonly config: Config;
  private readonly logger: LoggerService;
  private readonly scheduler: SchedulerService;

  static newProvider(
    config: Config,
    logger: LoggerService,
    scheduler: SchedulerService,
  ): MTAProvider {
    const p = new MTAProvider(config, logger, scheduler);
    scheduler.scheduleTask({
      frequency: { seconds: 30 },
      timeout: { seconds: 30 },
      id: 'sync-mta-catalog',
      fn: p.run,
    });

    return p;
  }
  /** [1] */
  constructor(
    config: Config,
    logger: LoggerService,
    scheduler: SchedulerService,
  ) {
    this.config = config;
    this.logger = logger;
    this.scheduler = scheduler;
    this.run = this.run.bind(this);
  }

  /** [2] */
  getProviderName(): string {
    return `MTAProvider`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { seconds: 5 },
      timeout: { seconds: 30 },
      id: 'sync-mta-catalog',
      fn: this.run,
    });
    await this.run();
  }

  /** [4] */
  async run(): Promise<void> {
    try {
      if (!this.connection) {
        this.logger.info('Not initialized');
        throw new Error('Not initialized');
      }

      const tokenSet = await this.authenticate();
      if (!tokenSet.access_token) {
        this.logger.error('Authentication failed: No access token received');
        return;
      }

      const applications = await this.fetchApplications(tokenSet.access_token);
      if (applications.length === 0) {
        this.logger.error('No applications found');
        return;
      }

      await this.processApplications(applications);
    } catch (error) {
      this.logger.error(`Run method failed: ${error}`);
    }
  }

  async authenticate() {
    const baseUrl = this.config.getString('mta.url');
    const realm = this.config.getString('mta.providerAuth.realm');
    const clientID = this.config.getString('mta.providerAuth.clientID');
    const secret = this.config.getString('mta.providerAuth.secret');
    const baseURLAuth = `${baseUrl}/auth/realms/${realm}`;
    this.logger.info(`Discovering issuer from ${baseURLAuth}`);

    custom.setHttpOptionsDefaults({
      timeout: 5000, // Extend timeout to 5000ms
    });

    let mtaAuthIssuer;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        mtaAuthIssuer = await Issuer.discover(baseURLAuth);
        this.logger.info('Issuer discovered successfully');
        break; // Exit loop on success
      } catch (error: any) {
        this.logger.error(
          `Attempt ${attempt}: Discovery failed - ${error?.message}`,
        );
        if (attempt === maxRetries) {
          throw new Error(
            `Failed to discover issuer after ${maxRetries} attempts: ${error.message}`,
          );
        }
      }
    }
    if (!mtaAuthIssuer) {
      throw new Error('Failed to discover issuer');
    }
    const authClient = new mtaAuthIssuer.Client({
      client_id: clientID,
      client_secret: secret,
      response_types: ['code'],
    });

    this.logger.info('Client created successfully');

    this.logger.info('Attempting to obtain grant');

    try {
      const grant = await authClient.grant({
        grant_type: 'client_credentials',
      });
      this.logger.info('Grant obtained successfully');
      return grant;
    } catch (error: any) {
      this.logger.error(`Error obtaining grant: ${error.message}`);
      throw new Error(`Failed to obtain grant: ${error.message}`);
    }
  }

  async fetchApplications(accessToken: string) {
    const url = `${this.config.getString('mta.url')}/hub/applications`;
    this.logger.info(`Attempting to fetch applications from ${url}`);

    const response = await fetch(
      `${this.config.getString('mta.url')}/hub/applications`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json, text/plain, */*',
          Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
      },
    );

    this.logger.info(`Received response with status: ${response.status}`);

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch applications: Status ${response.status}`,
      );
    }
    return response.json();
  }

  async processApplications(applications: any) {
    try {
      // Map applications to entities
      const entities = applications.map((app: any) =>
        this.mapApplicationToEntity(app),
      );

      // Apply mutations to update the catalog
      await this.connection?.applyMutation({
        type: 'full',
        entities: entities,
      });

      // Optionally refresh connections or handle post-mutation logic
      this.logger.info(
        'Successfully processed applications, refreshing data...',
      );
      await this.refreshData(entities);
    } catch (error: any) {
      // Log detailed error messages
      this.logger.error(`Error processing applications: ${error.message}`, {
        error,
      });
      throw new Error(`Error processing applications: ${error.message}`);
    }
  }

  mapApplicationToEntity(application: any) {
    // Example mapping logic, which you should customize based on your application structure
    const name = application.name.replace(/ /g, '-');
    const encodedAppName = encodeURIComponent(JSON.stringify(application.name));
    const issuesUrl = `${this.config.getString(
      'mta.url',
    )}/issues?i%3Afilters=%7B%22application.name%22%3A%5B${encodedAppName}%5D%7D&i%3AitemsPerPage=10&i%3ApageNumber=1&i%3AsortColumn=description&i%3AsortDirection=asc`;
    const tasksUrl = `${this.config.getString(
      'mta.url',
    )}/tasks?i%3Afilters=%7B%22application%22%3A%5B${encodedAppName}%5D%7D&i%3AitemsPerPage=10&i%3ApageNumber=1&i%3AsortColumn=description&i%3AsortDirection=asc`;

    return {
      key: application.id,
      locationKey: this.getProviderName(),
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          annotations: {
            'backstage.io/managed-by-location': `url:${this.config.getString(
              'mta.url',
            )}/application/${application.id}`,
            'backstage.io/managed-by-origin-location': `url:${this.config.getString(
              'mta.url',
            )}/application/${application.id}`,
            'issues-url': issuesUrl,
            'tasks-url': tasksUrl,
            'mta-url': `${this.config.getString('mta.url')}`,
          },
          name: name,
          id: application.id,
          namespace: 'default',
          application: application,
        },
        spec: {
          type: 'service',
          lifecycle: 'experimental',
          owner: 'unknown',
        },
      },
    };
  }

  async refreshData(entities: any) {
    // Refresh logic, such as refreshing entity keys or other post-update tasks
    const keys = entities.map((entity: any) => entity.key);
    await this.connection?.refresh({ keys });
    this.logger.info('Data refresh triggered for entities.');
  }
}

// const getResponse = await fetch(`${baseUrlHub}/applications`, {
//   credentials: 'include',
//   headers: {
//     Accept: 'application/json, text/plain, */*',
//     Authorization: `Bearer ${tokenSet.access_token}`,
//   },
//   method: 'GET',
// });

// if (getResponse.status !== 200) {
//   this.logger.info(
//     `unable to call hub ${getResponse.status} message ${JSON.stringify(
//       await getResponse.text(),
//     )}`,
//   );
//   return;
// }
// const j = await getResponse.json();
// if (!Array.isArray(j)) {
//   this.logger.info('expecting array of applications');
//   return;
// }

// this.logger.info(`status: ${getResponse.status} json ${JSON.stringify(j)}`);
//  mapApplicationToEntity

//     await this.connection
//       .applyMutation({
//         type: 'full',
//         entities: j.map(application => {
//           const name = application.name.replace(/ /g, '-');
//           const encodedAppName = encodeURIComponent(
//             JSON.stringify(application.name),
//           ); // Ensure the application name is URI-encoded
//           const issuesUrl = `${baseUrlMta}/issues?i%3Afilters=%7B%22application.name%22%3A%5B${encodedAppName}%5D%7D&i%3AitemsPerPage=10&i%3ApageNumber=1&i%3AsortColumn=description&i%3AsortDirection=asc`;

//           return {
//             key: application.id,
//             locationKey: this.getProviderName(),
//             entity: {
//               apiVersion: 'backstage.io/v1alpha1',
//               kind: 'Component',
//               metadata: {
//                 annotations: {
//                   'backstage.io/managed-by-location': `url:${baseUrlMta}/application/${application.id}`,
//                   'backstage.io/managed-by-origin-location': `url:${baseUrlMta}/application/${application.id}`,
//                   'issues-url': `${issuesUrl}`,
//                 },
//                 name: name,
//                 id: application.id,
//                 namespace: 'default',
//                 application: application,
//               },
//               spec: {
//                 type: 'service',
//                 lifecycle: 'experimental',
//                 owner: 'unknown',
//               },
//             },
//           };
//         }),
//       })
//       .then(() => {
//         console.log('REFRESHING');
//         this.logger.info('refreshing');
//         this.connection?.refresh({
//           keys: j.map(application => application.id),
//         });
//       })
//       .catch(e => {
//         this.logger.info(`error applying mutation ${e}`);
//       });
//   }
// }
// const baseUrl = this.config.getString('mta.url');
// const baseUrlHub = `${baseUrl}/hub`;
// const baseUrlMta = `${baseUrl}`;
// const realm = this.config.getString('mta.providerAuth.realm');
// const clientID = this.config.getString('mta.providerAuth.clientID');
// const secret = this.config.getString('mta.providerAuth.secret');
// const baseURLAuth = `${baseUrl}/auth/realms/${realm}`;
// const mtaAuthIssuer = await Issuer.discover(baseURLAuth);
// const authClient = new mtaAuthIssuer.Client({
//   client_id: clientID,
//   client_secret: secret,
//   response_types: ['code'],
// });
// const code_verifier = generators.codeVerifier();
// const code_challenge = generators.codeChallenge(code_verifier);

// const tokenSet = await authClient.grant({
//   grant_type: 'client_credentials',
// });
// if (!tokenSet.access_token) {
//   this.logger.info('unable to access hub');
// }

// console.log({
//   code_verifier,
//   code_challenge,
//   tokenSet,
//   baseURLAuth,
//   baseUrlHub,
// });

// this.logger.info({
//   code_verifier,
//   code_challenge,
//   tokenSet,
//   baseURLAuth,
//   baseUrlHub,
// });
// }
