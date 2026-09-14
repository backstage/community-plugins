/*
 * Copyright 2026 The Backstage Authors
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
import { KubernetesApi } from '@backstage/plugin-kubernetes-react';

import {
  Application,
  InstanceApplications,
} from '@backstage-community/plugin-argocd-common';

import {
  ArgoCDApi,
  ArgoCDAppDeployRevisionDetails,
  FindApplicationsOptions,
  GetApplicationOptions,
  ListAppsOptions,
  RevisionDetailsListOptions,
  RevisionDetailsOptions,
} from '../../src/api';
import { customResourceTypes } from '../../src/types/resources';
import { DEV_INSTANCE_APPLICATIONS, mockIdRevisions } from '../__data__';

const getInstanceNameFromUrl = (url: string): string => {
  return url.replace('/argoInstance/', '');
};

export class MockArgoCDApiClient implements ArgoCDApi {
  async listApps(options: ListAppsOptions): Promise<{ items: Application[] }> {
    const instanceName = getInstanceNameFromUrl(options.url);
    let apps = DEV_INSTANCE_APPLICATIONS[instanceName] ?? [];

    if (options.appSelector) {
      const decodedSelector = decodeURIComponent(options.appSelector);
      const [labelKey, labelValue] = decodedSelector.split('=', 2);
      apps = apps.filter(app => app.metadata.labels?.[labelKey] === labelValue);
    }

    return { items: apps };
  }

  async getRevisionDetails(
    options: RevisionDetailsOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails> {
    return mockIdRevisions[options.revisionID];
  }

  async getRevisionDetailsList(
    options: RevisionDetailsListOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails[]> {
    if (!options.revisionIDs || options.revisionIDs.length < 1) {
      return [];
    }
    const promises: Promise<ArgoCDAppDeployRevisionDetails>[] = [];

    options.revisionIDs.forEach((revisionID: string) => {
      const application = options.apps.find(app =>
        app?.status?.history?.find(h => h.revision === revisionID),
      );

      if (application) {
        promises.push(
          this.getRevisionDetails({
            app: application.metadata.name as string,
            appNamespace: options.appNamespace,
            instanceName: application.metadata.instance.name,
            revisionID,
          }),
        );
      }

      const multiSourceApp = options.apps.find(app =>
        app?.status?.history?.find(h => h?.revisions?.includes(revisionID)),
      );

      if (multiSourceApp) {
        const history = multiSourceApp.status?.history ?? [];
        const relevantHistories = history.filter(h =>
          h?.revisions?.includes(revisionID),
        );

        relevantHistories.forEach(h => {
          const revisionSourceIndex = h.revisions?.indexOf(revisionID);
          promises.push(
            this.getRevisionDetails({
              app: multiSourceApp.metadata.name as string,
              appNamespace: options.appNamespace,
              instanceName: multiSourceApp.metadata.instance.name,
              revisionID,
              sourceIndex: revisionSourceIndex,
            }),
          );
        });
      }
    });
    return Promise.all(promises);
  }

  async getApplication(options: GetApplicationOptions): Promise<Application> {
    const instanceName = getInstanceNameFromUrl(options.url);

    if (!DEV_INSTANCE_APPLICATIONS[instanceName]) {
      throw new Error(
        `Failed to fetch Application from Instance ${instanceName} : ArgoCD Instance ${instanceName} not found`,
      );
    }

    const result = DEV_INSTANCE_APPLICATIONS[instanceName].filter(
      app => app.metadata.name === options.appName,
    )[0];
    if (!result) {
      throw new Error(
        `Failed to fetch data, status 403: Insufficient permissions for ArgoCD server`,
      );
    }

    return result;
  }

  async findApplications(
    options: FindApplicationsOptions,
  ): Promise<InstanceApplications[]> {
    const result: InstanceApplications[] = [];
    for (const [instanceName, apps] of Object.entries(
      DEV_INSTANCE_APPLICATIONS,
    )) {
      const matchingApps = apps.filter(
        app =>
          app.metadata.name === options.appName &&
          app.metadata.name !== undefined,
      );

      if (matchingApps.length !== 0) {
        result.push({
          name: instanceName,
          url: matchingApps[0].metadata.instance.url,
          appName: [options.appName],
          applications: matchingApps,
        });
      }
    }
    return result;
  }
}

export class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => {
        if (
          customResourceTypes.map(t => t.toLocaleLowerCase()).includes(type)
        ) {
          return {
            type: 'customresources',
            resources,
          };
        }
        return {
          type: type.toLocaleLowerCase('en-US'),
          resources,
        };
      },
    );
  }

  async getWorkloadsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getCustomObjectsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getObjectsByEntity(): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }

  async getCluster(_clusterName: string): Promise<
    | {
        name: string;
        authProvider: string;
        oidcTokenProvider?: string;
        dashboardUrl?: string;
      }
    | undefined
  > {
    return { name: 'mock-cluster', authProvider: 'serviceAccount' };
  }

  async proxy(_options: { clusterName: string; path: string }): Promise<any> {
    return {
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: {
        name: 'mock-ns',
      },
    };
  }
}

export const mockKubernetesAuthProviderApi = {
  decorateRequestBodyForAuth: async () => {
    return {
      entity: {
        apiVersion: 'v1',
        kind: 'xyz',
        metadata: { name: 'hey' },
      },
    };
  },
  getCredentials: async () => {
    return {};
  },
};
