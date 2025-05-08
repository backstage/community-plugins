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
import { AppHealth } from '@backstage-community/plugin-kiali-common/func';
import { DRAWER } from '@backstage-community/plugin-kiali-common/types';
import type {
  App,
  AppQuery,
} from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import { AxiosError } from 'axios';
import { default as React } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { HistoryManager } from '../../app/History';
import { serverConfig } from '../../config';
import { AppInfo } from '../../pages/AppDetails/AppInfo';
import { kialiApiRef } from '../../services/Api';

type Props = {
  namespace: string;
  app: string;
};
export const AppDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const [appItem, setAppItem] = React.useState<App>();
  const [health, setHealth] = React.useState<AppHealth>();
  const cluster = HistoryManager.getClusterName();

  const fetchApp = async () => {
    const params: AppQuery = {
      rateInterval: `60s`,
      health: 'true',
    };

    kialiClient
      .getApp(props.namespace, props.app, params, cluster)
      .then((appResponse: App) => {
        const healthR = AppHealth.fromJson(
          props.namespace,
          props.app,
          appResponse.health,
          {
            rateInterval: 60,
            hasSidecar: appResponse.workloads.some(w => w.istioSidecar),
            hasAmbient: appResponse.workloads.some(w => w.istioAmbient),
          },
          serverConfig,
        );
        setAppItem(appResponse);
        setHealth(healthR);
      })
      .catch((err: AxiosError<unknown, any>) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchApp();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {appItem && (
        <AppInfo app={appItem} duration={60} health={health} view={DRAWER} />
      )}
    </>
  );
};
