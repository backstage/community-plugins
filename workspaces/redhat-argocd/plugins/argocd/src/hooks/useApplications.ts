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

interface AppOptions {
  instanceName: string;
  appSelector: string;
  intervalMs?: number;
  projectName?: string;
  appName?: string;
  appNamespace?: string;
}

export const useApplications = ({
  appName,
  appNamespace,
  instanceName,
  appSelector,
  projectName,
  intervalMs = 10000,
}: AppOptions): {
  apps: Application[];
  error: Error | undefined;
  loading: boolean;
} => {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [, setAppSelector] = useState<string>(appSelector ?? '');
  const [, setAppName] = useState<string | undefined>(appName ?? '');
  const [apps, setApps] = useState<Application[]>([]);

  const api = useApi(argoCDApiRef);

  const getApplications = useCallback(async () => {
    return await api
      .listApps({
        url: `/argoInstance/${instanceName}`,
        appSelector,
        projectName,
        appNamespace,
      })
      .then(applications => setApps(applications?.items ?? []));
  }, [api, appSelector, instanceName, projectName, appNamespace]);

  const getApplication = useCallback(async () => {
    return await api
      .getApplication({
        url: `/argoInstance/${instanceName}`,
        appName: appName as string,
        appNamespace,
        project: projectName,
      })
      .then(application => setApps([application]));
  }, [api, appName, appNamespace, projectName, instanceName]);

  const { error, loading, retry } = useAsyncRetry(async () => {
    if (appName) {
      return await getApplication();
    }
    return await getApplications();
  }, [getApplications, getApplication]);

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
