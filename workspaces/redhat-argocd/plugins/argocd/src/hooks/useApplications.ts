import * as React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { argoCDApiRef } from '../api';
import { Application } from '../types';

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
  const [loadingData, setLoadingData] = React.useState<boolean>(true);
  const [, setAppSelector] = React.useState<string>(appSelector ?? '');
  const [, setAppName] = React.useState<string | undefined>(appName ?? '');
  const [apps, setApps] = React.useState<Application[]>([]);

  const api = useApi(argoCDApiRef);

  const getApplications = React.useCallback(async () => {
    return await api
      .listApps({
        url: `/argoInstance/${instanceName}`,
        appSelector,
        projectName,
      })
      .then(applications => setApps(applications?.items ?? []));
  }, [api, appSelector, instanceName, projectName]);

  const getApplication = React.useCallback(async () => {
    return await api
      .getApplication({
        url: `/argoInstance/${instanceName}`,
        appName: appName as string,
        appNamespace,
      })
      .then(application => setApps([application]));
  }, [api, appName, appNamespace, instanceName]);

  const { error, loading, retry } = useAsyncRetry(async () => {
    if (appName) {
      return await getApplication();
    }
    return await getApplications();
  }, [getApplications, getApplication]);

  useInterval(() => retry(), intervalMs);

  React.useEffect(() => {
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
