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
import { useState, useCallback, useEffect } from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { argoCDApiRef } from '../api';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import { useArgocdConfig } from './useArgocdConfig';

interface AppOptions {
  instanceNames: string[];
  appSelector: string;
  projectName?: string;
  appName?: string;
  appNamespace?: string;
}

export const useApplications = ({
  appName,
  appNamespace,
  instanceNames,
  appSelector,
  projectName,
}: AppOptions): {
  apps: Application[];
  error: Error | undefined;
  loading: boolean;
} => {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [, setAppSelector] = useState<string>(appSelector ?? '');
  const [, setAppName] = useState<string | undefined>(appName ?? '');
  const [apps, setApps] = useState<Application[]>([]);
  const { intervalMs, instances } = useArgocdConfig();

  const api = useApi(argoCDApiRef);

  const addInstanceToApplication = useCallback(
    (item: Application, instanceName: string) => {
      if (
        item.metadata &&
        (!item.metadata.instance?.name || !item.metadata.instance?.url)
      ) {
        const instanceUrl =
          item.metadata.instance?.url ??
          instances.find(instance => instance.name === instanceName)?.url;
        item.metadata.instance = { name: instanceName, url: instanceUrl };
      }
      return item;
    },
    [instances],
  );

  const listApplications = useCallback(async () => {
    // Search all instances if no concrete instances to search
    const instanceNamesToSearch =
      instanceNames.length === 0 ? instances.map(i => i.name) : instanceNames;
    const promises = instanceNamesToSearch.map(instanceName =>
      api
        .listApps({
          url: `/argoInstance/${instanceName}`,
          appSelector,
          projectName,
          appNamespace,
        })
        .then(applications =>
          // Roadie doesn't include full instance in its getApplications response
          (applications?.items ?? []).map(application =>
            addInstanceToApplication(application, instanceName),
          ),
        ),
    );
    const results = await Promise.all(promises);
    setApps(results.flat());
  }, [
    api,
    appSelector,
    instanceNames,
    projectName,
    appNamespace,
    instances,
    addInstanceToApplication,
  ]);

  // Get application by application name from Argo instance, application must exist there, otherwise Error
  const getApplication = useCallback(
    (instanceName: string, applicationName: string) => {
      return (
        api
          .getApplication({
            url: `/argoInstance/${instanceName}`,
            appName: applicationName,
            appNamespace,
            project: projectName,
          })
          // Roadie doesn't include instance in its getApplication response
          .then(application =>
            addInstanceToApplication(application, instanceName),
          )
      );
    },
    [api, appNamespace, projectName, addInstanceToApplication],
  );

  const getApplications = useCallback(async () => {
    const promises = instanceNames.map(instanceName =>
      getApplication(instanceName, appName as string),
    );
    const results = await Promise.all(promises);
    setApps(results);
  }, [instanceNames, appName, getApplication]);

  // Find applications across Argo instances
  const findApplications = useCallback(async () => {
    const instanceApplicationsList = await api.findApplications({
      appName: appName as string,
      appNamespace,
      project: projectName,
    });

    const applicationsExpanded = instanceApplicationsList.some(
      instance => instance.applications,
    );
    if (applicationsExpanded) {
      setApps(
        instanceApplicationsList
          .flatMap(instanceApplications => instanceApplications.applications)
          .filter(app => app !== undefined),
      );
      return;
    }

    // Roadie doesn't directly return all application data, we need to fetch it for each application
    const promises = instanceApplicationsList.flatMap(instanceApplications =>
      instanceApplications.appName.map(currentAppName =>
        getApplication(instanceApplications.name, currentAppName),
      ),
    );
    const applications = await Promise.all(promises);
    setApps(applications);
  }, [api, appName, appNamespace, projectName, getApplication]);

  const { error, loading, retry } = useAsyncRetry(async () => {
    if (appName && instanceNames.length === 0) {
      // Don't have concrete ArgoCD instances to search => search all ArgoCD instances for applications
      return await findApplications();
    }
    if (appName) {
      // Get applications from concrete ArgoCD instances, returns Error if application doesn't exist in ArgoCD instance
      return await getApplications();
    }
    // Future: we could call listApplications for all use cases, as Argo supports filtering by app name here (Roadie doesn't yet)
    return await listApplications();
  }, [listApplications, getApplications]);

  useInterval(() => retry(), intervalMs);

  useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      if (appSelector) {
        setAppSelector(prevState => {
          if (prevState === appSelector) {
            setLoadingData(false);
            return appSelector;
          }
          setLoadingData(true);

          return appSelector;
        });
      } else {
        setAppName(oldName => {
          if (oldName === appName) {
            setLoadingData(false);
            return appName;
          }
          setLoadingData(true);

          return appName;
        });
      }
    }
    return () => {
      mounted = false;
    };
  }, [loading, appSelector, appName]);

  return { apps, error, loading: loadingData };
};
