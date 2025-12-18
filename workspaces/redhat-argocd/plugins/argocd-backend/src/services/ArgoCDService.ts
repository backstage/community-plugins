/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Instance,
  Application,
  RevisionInfo,
  InstanceApplications,
} from '@backstage-community/plugin-redhat-argocd-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  AuthenticationError,
  isError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import {
  getInstanceByName,
  toInstance,
  processFetch,
  formatOperationMessage,
  buildArgoUrl,
  makeArgoRequest,
} from './serviceUtils';
import { Agent, setGlobalDispatcher } from 'undici';

const CONFIG = {
  APP_LOCATOR: 'argocd.appLocatorMethods',
  TYPE: 'config',
  INSTANCES: 'instances',
};
export class ArgoCDService {
  private readonly config: Config;
  private readonly logger: LoggerService;
  private readonly password: string;
  private readonly username: string;

  constructor(configService: Config, loggerService: LoggerService) {
    this.config = configService;
    this.logger = loggerService;
    this.username = this.config.getOptionalString('argocd.username') ?? 'admin';
    this.password =
      this.config.getOptionalString('argocd.password') ?? 'password';

    // For local development using a local Argo CD Instance
    // Do NOT use in Production
    if (this.config.getOptionalBoolean('argocd.localDevelopment')) {
      const agent = new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      });
      setGlobalDispatcher(agent);
    }
  }

  /**
   * Retrieves all configured ArgoCD instances
   *
   * @returns {Instance[]} Array of ArgoCD Instances
   */
  getArgoInstances(): Instance[] {
    return this.config
      .getConfigArray(CONFIG.APP_LOCATOR)
      .filter(el => el.getString('type') === CONFIG.TYPE)
      .flatMap(config => config.getConfigArray(CONFIG.INSTANCES))
      .map(toInstance);
  }

  /**
   * Validates and retrieves an ArgoCD instance by name
   *
   * @param {string} instanceName Name of the ArgoCD Instance
   * @returns {Instance} The validated instance
   * @throws {Error} When instance is not found
   */
  private validateInstance(instanceName: string): Instance {
    const matchedInstance = getInstanceByName({
      instances: this.getArgoInstances(),
      instanceName,
    });

    if (!matchedInstance) {
      this.logger.error(`ArgoCD Instance ${instanceName} not found`);
      throw new Error(`ArgoCD Instance ${instanceName} not found`);
    }

    return matchedInstance;
  }

  /**
   * Retrieves an authentication token for an ArgoCD Instance
   *
   * @param {Object} instance - Instance configuration
   * @param {string} instance.url - Instance URL
   * @param {string} [instance.username] - Optional username override
   * @param {string} [instance.password] - Optional password override
   * @returns {Promise<string>} Authentication token
   * @throws {Error} When token cannot be retrieved
   */
  private async getToken(instance: {
    url: string;
    username?: string;
    password?: string;
  }): Promise<string> {
    const { url, username, password } = instance;

    const response = await fetch(`${url}/api/v1/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // The define credentials for the instance have higher priority
        // over the default credentials.
        username: username ?? this.username,
        password: password ?? this.password,
      }),
    } as RequestInit);

    this.logger.info(`Fetching ArgoCD access token for ${url}`);
    const data = await processFetch(response, url);

    if (!data.token) {
      throw new Error(
        `Failed to fetch ArgoCD access token from ${url}: no token returned`,
      );
    }

    return data.token;
  }

  /**
   * Lists all ArgoCD Applications based on provided criteria
   *
   * @param {string} instanceName - Name of the ArgoCD instance
   * @param {Object} options - Filter options
   * @param {string} [options.selector] - Label selector
   * @param {string} [options.name] - ArgoCD Application name
   * @param {string} [options.appNamespace] - ArgoCD Application namespace
   * @param {string} [options.project] - The project the ArgoCD Application lives in
   * @returns {Promise<{ items: Application[] }} Array of applications
   * @throws {Error} - When error occurs
   */
  async listArgoApps(
    instanceName: string,
    options?: {
      selector?: string;
      name?: string;
      appNamespace?: string;
      project?: string;
    },
  ): Promise<{ items: Application[] }> {
    try {
      const matchedInstance = this.validateInstance(instanceName);
      const url = buildArgoUrl(matchedInstance.url, 'applications', options);
      const token =
        matchedInstance.token ?? (await this.getToken(matchedInstance));

      const logMsg = formatOperationMessage(
        'Fetching Applications',
        instanceName,
        options,
      );
      this.logger.info(logMsg);

      const data = await makeArgoRequest(url, token);

      if (!data?.items?.length) {
        const message = formatOperationMessage(
          'No Applications returned',
          instanceName,
          options,
        );
        this.logger.warn(message);

        return { ...data, items: [] };
      }

      // Add instance metadata
      const applications = {
        ...data,
        items:
          data?.items?.map((app: Application) => {
            return {
              ...app,
              metadata: {
                ...app.metadata,
                instance: {
                  name: matchedInstance.name,
                  url: matchedInstance.url,
                },
              },
            };
          }) || [],
      };

      return applications;
    } catch (error) {
      const baseMessage = formatOperationMessage(
        'Failed to retrieve ArgoCD Applications',
        instanceName,
        options,
      );
      return this.handleError(baseMessage, error);
    }
  }

  /**
   * Retrieves details for a specific revision of an ArgoCD Application
   *
   * @param {string} instanceName  - Name of the ArgoCD instance
   * @param {string} appName - Name of the application
   * @param {string} revisionID - Revision identifier
   * @param {Object} options - Filter options
   * @param {string} [options.appNamespace] - ArgoCD Application namespace
   * @param {string} [options.sourceIndex] - Source index (for multi source apps).
   * @returns {Promise<Revision>} Revision details
   * @throws {Error} - When error occurs
   */
  async getRevisionDetails(
    instanceName: string,
    appName: string,
    revisionID: string,
    options?: {
      appNamespace?: string;
      sourceIndex?: string;
    },
  ): Promise<RevisionInfo> {
    try {
      const matchedInstance = this.validateInstance(instanceName);
      const { appNamespace, sourceIndex } = options ?? {};
      const token =
        matchedInstance.token ?? (await this.getToken(matchedInstance));

      const path = `applications/${appName}/revisions/${revisionID}/metadata`;
      const url = buildArgoUrl(matchedInstance.url, path, {
        ...(appNamespace && { appNamespace }),
        ...(sourceIndex && { sourceIndex }),
      });
      const logMsg = formatOperationMessage(
        `Fetching Revision data for ${appName}`,
        instanceName,
        {
          appNamespace: appNamespace ?? 'N/A',
          sourceIndex: sourceIndex ?? 'N/A',
        },
      );
      this.logger.info(logMsg);
      const data = await makeArgoRequest(url, token);

      // Add this small modification so we can identify the revision with the message
      // in the front end.
      data.revisionID = revisionID;

      return data;
    } catch (error) {
      const baseMessage = formatOperationMessage(
        'Failed to fetch Revision data',
        instanceName,
        {
          revisionID,
          appName,
          appNamespace: options?.appNamespace ?? 'N/A',
          sourceIndex: options?.sourceIndex ?? 'N/A',
        },
      );
      return this.handleError(baseMessage, error);
    }
  }

  /**
   * Retrieves an application from ArgoCD
   *
   * @param {string} instanceName - Name of the ArgoCD instance
   * @param {Object} [options] - Request options
   * @param {string} [options.appNamespace] - ArgoCD Application namespace
   * @param {string} [options.appName] - Application name
   * @param {string} [options.project] - The project the ArgoCD Application lives in
   * @returns {Promise<Application>} - Application data
   * @throws {Error} - When error occurs
   */
  async getApplication(
    instanceName: string,
    options?: {
      appNamespace?: string;
      appName?: string;
      project?: string;
    },
  ): Promise<Application> {
    const { appName, appNamespace, project } = options ?? {};
    try {
      const matchedInstance = this.validateInstance(instanceName);
      const token =
        matchedInstance.token ?? (await this.getToken(matchedInstance));

      const path = appName ? `applications/${appName}` : 'applications';
      const url = buildArgoUrl(matchedInstance.url, path, {
        ...(appNamespace && { appNamespace }),
        ...(project && { project }),
      });
      const logMsg = formatOperationMessage(
        'Fetching Application',
        instanceName,
        options,
      );
      this.logger.info(logMsg);
      const data = await makeArgoRequest(url, token);

      // Add instance metadata
      const application = {
        ...data,
        metadata: {
          ...data.metadata,
          instance: {
            name: matchedInstance.name,
            url: matchedInstance.url,
          },
        },
      };

      return application;
    } catch (error) {
      const baseMessage = formatOperationMessage(
        'Failed to fetch Application',
        instanceName,
        options,
      );
      return this.handleError(baseMessage, error);
    }
  }

  /**
   * Retrieves applications from all ArgoCD instances filtered by options
   *
   * @param {Object} [options] - Request options
   * @param {string} [options.appName] - Application name
   * @param {string} [options.project] - The project the ArgoCD Application lives in
   * @param {string} [options.appNamespace] - ArgoCD Application namespace
   * @param {string} [options.expand] - If set to applications, return expanded InstanceApplications with applications
   * @returns {Promise<InstanceApplications[]>} - Instance application data
   * @throws {Error} - When error occurs
   */
  async findApplications(options: {
    appName: string;
    project?: string;
    appNamespace?: string;
    expand?: string;
  }): Promise<InstanceApplications[]> {
    const { appName, appNamespace, project, expand } = options;
    const includeApplications = expand === 'applications';

    const applications = await Promise.all(
      this.getArgoInstances().map(instance =>
        this.listArgoApps(instance.name, {
          name: appName,
          project,
          appNamespace,
        }).then(applicationsResponse => applicationsResponse.items ?? []),
      ),
    );

    const instanceMap: { [instanceName: string]: InstanceApplications } = {};
    for (const app of applications.flat()) {
      const instanceName = app.metadata.instance.name;

      if (!instanceMap[instanceName]) {
        instanceMap[instanceName] = {
          name: instanceName,
          url: app.metadata.instance.url,
          appName: [appName],
          ...(includeApplications && { applications: [app] }),
        };
      } else if (includeApplications) {
        // don't duplicate appName in appName array - always the same as we search by it
        instanceMap[instanceName].applications?.push(app);
      }
    }

    return Object.values(instanceMap);
  }

  /**
   * Handles and formats error messages
   *
   * @param {string} message - Base error message
   * @param {unknown} error - Error object
   * @throws {AuthenticationError | NotAllowedError | NotFoundError | Error} Formatted error with message and details
   */
  private handleError(message: string, error: unknown): never {
    const errorMessage = isError(error) ? error.message : String(error);
    const formattedMessage = `${message} : ${errorMessage}`;

    if (error instanceof AuthenticationError) {
      throw new AuthenticationError(formattedMessage);
    }
    if (error instanceof NotAllowedError) {
      throw new NotAllowedError(formattedMessage);
    }
    if (error instanceof NotFoundError) {
      throw new NotFoundError(formattedMessage);
    }

    throw new Error(formattedMessage);
  }
}
