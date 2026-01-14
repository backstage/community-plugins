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
import { useState, useEffect } from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { argoCDInstanceApiRef } from '../api';
import { Application } from '@backstage-community/plugin-argocd-common';
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
  const { intervalMs } = useArgocdConfig();

  const api = useApi(argoCDInstanceApiRef);

  const { error, loading, retry } = useAsyncRetry(async () => {
    const applications = await api.searchApplications(instanceNames, {
      appSelector,
      appNamespace,
      project: projectName,
      appName,
    });
    setApps(applications);
  }, [api, instanceNames, appSelector, appNamespace, projectName, appName]);

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
