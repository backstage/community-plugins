/*
 * Copyright 2024 The Backstage Authors
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
  Application,
  Instance,
} from '@backstage-community/plugin-redhat-argocd-common';

import {
  ArgoCDApi,
  ArgoCDInstanceApi,
  FindApplicationsOptions,
  ListAppsOptions,
  SearchApplicationsOptions,
} from '.';

export type ArgoCDInstanceApiClientOptions = {
  argoCDApi: ArgoCDApi;
  instances: Instance[];
};

export class ArgoCDInstanceApiClient implements ArgoCDInstanceApi {
  private readonly argoCDApi: ArgoCDApi;
  private readonly instances: Instance[];

  constructor(options: ArgoCDInstanceApiClientOptions) {
    this.argoCDApi = options.argoCDApi;
    this.instances = options.instances;
  }

  async searchApplications(
    instanceNames: string[],
    options: SearchApplicationsOptions,
  ): Promise<Application[]> {
    const { appSelector, appName, appNamespace, project } = options;

    if (appName && instanceNames.length === 0) {
      // No concrete ArgoCD instances specified => search all instances for app with appName
      // We are not directly calling /applications/:appName (getApplicationsByName), as it returns 403 if app doesn't exist
      return this.findApplicationsByName({
        appName,
        appNamespace,
        project,
      });
    }

    if (appName) {
      // Get app from specific ArgoCD instances
      return await Promise.all(
        instanceNames.map(instanceName =>
          this.getApplicationByName(instanceName, {
            appName,
            appNamespace,
            project,
          }),
        ),
      );
    }

    // List applications using selector
    return this.listApplicationsBySelector(instanceNames, {
      appSelector,
      appNamespace,
      projectName: project,
    });
  }

  private enrichApplicationWithInstance(
    application: Application,
    instanceName: string,
  ): Application {
    if (
      application.metadata &&
      (!application.metadata.instance?.name ||
        !application.metadata.instance?.url)
    ) {
      const instanceUrl =
        application.metadata.instance?.url ??
        this.instances.find(instance => instance.name === instanceName)?.url;
      application.metadata.instance = { name: instanceName, url: instanceUrl };
    }
    return application;
  }

  private async listApplicationsBySelector(
    instanceNames: string[],
    options: Omit<ListAppsOptions, 'url'>,
  ): Promise<Application[]> {
    // Search all instances if no concrete instances to search
    const instanceNamesToSearch =
      instanceNames.length === 0
        ? this.instances.map(i => i.name)
        : instanceNames;

    const promises = instanceNamesToSearch.map(instanceName =>
      this.argoCDApi
        .listApps({
          url: `/argoInstance/${instanceName}`,
          ...options,
        })
        .then(applications =>
          // Roadie doesn't include full instance in its getApplications response
          (applications?.items ?? []).map(application =>
            this.enrichApplicationWithInstance(application, instanceName),
          ),
        ),
    );
    const results = await Promise.all(promises);

    return results.flat();
  }

  private async getApplicationByName(
    instanceName: string,
    options: FindApplicationsOptions,
  ): Promise<Application> {
    const { appName, appNamespace, project } = options;
    const application = await this.argoCDApi.getApplication({
      url: `/argoInstance/${instanceName}`,
      appName,
      appNamespace,
      project,
    });

    // Roadie doesn't include instance in its getApplication response
    return this.enrichApplicationWithInstance(application, instanceName);
  }

  private async findApplicationsByName(
    options: FindApplicationsOptions,
  ): Promise<Application[]> {
    const { appName, appNamespace, project } = options;
    const instanceApplicationsList = await this.argoCDApi.findApplications({
      appName,
      appNamespace,
      project,
    });

    const applicationsExpanded = instanceApplicationsList.some(
      instance => instance.applications,
    );

    if (applicationsExpanded) {
      return instanceApplicationsList
        .flatMap(instanceApplications => instanceApplications.applications)
        .filter((app): app is Application => app !== undefined);
    }

    // Roadie doesn't directly return all application data, we need to fetch it for each application
    const promises = instanceApplicationsList.flatMap(instanceApplications =>
      instanceApplications.appName.map(currentAppName =>
        this.getApplicationByName(instanceApplications.name, {
          appName: currentAppName,
          appNamespace,
          project,
        }),
      ),
    );

    return Promise.all(promises);
  }
}
