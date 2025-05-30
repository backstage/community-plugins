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
import type {
  App,
  AppQuery,
} from '@backstage-community/plugin-kiali-common/types';
import { MetricsObjectTypes } from '@backstage-community/plugin-kiali-common/types';
import { Content, EmptyState } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, Tab, Tabs } from '@material-ui/core';
import { AxiosError } from 'axios';
import { default as React } from 'react';
import { useLocation } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';
import { HistoryManager } from '../../app/History';
import {
  BreadcrumbView,
  getPath,
} from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { IstioMetrics } from '../../components/Metrics/IstioMetrics';
import { a11yProps, TabPanel, useStyles } from '../../components/Tab/TabPanel';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { serverConfig } from '../../config';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiContext } from '../../store';
import { KialiAppState } from '../../store/Store';
import { baseStyle } from '../../styles/StyleUtils';
import { AppInfo } from './AppInfo';

export const AppDetailsPage = (props: { entity?: boolean }) => {
  const path = getPath(useLocation());
  const namespace = path.namespace;
  const app = path.item;
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [appItem, setAppItem] = React.useState<App>();
  const [health, setHealth] = React.useState<AppHealth>();
  const [error, setError] = React.useState<string>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const cluster = HistoryManager.getClusterName();
  const [value, setValue] = React.useState<number>(0);
  const classes = useStyles();

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="app-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchApp = async () => {
    const params: AppQuery = {
      rateInterval: `${String(duration)}s`,
      health: 'true',
    };
    if (!namespace || !app) {
      setError(`Could not fetch application: Empty namespace or app name`);
      kialiState.alertUtils!.add(
        `Could not fetch application: Empty namespace or app name`,
      );
      return;
    }

    kialiClient
      .getApp(namespace, app, params, cluster)
      .then((appResponse: App) => {
        const healthR = AppHealth.fromJson(
          namespace,
          app,
          appResponse.health,
          {
            rateInterval: duration,
            hasSidecar: appResponse.workloads.some(w => w.istioSidecar),
            hasAmbient: appResponse.workloads.some(w => w.istioAmbient),
          },
          serverConfig,
        );
        setAppItem(appResponse);
        setHealth(healthR);
      })
      .catch((err: AxiosError<unknown, any>) => {
        setError(`Could not fetch application: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch application: ${getErrorString(err)}`,
        );
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

  const overviewTab = (): React.ReactElement => {
    return (
      <>
        {appItem && (
          <AppInfo app={appItem} duration={duration} health={health} />
        )}
      </>
    );
  };

  const inboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && app && (
          <IstioMetrics
            data-test="inbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={app}
            cluster={appItem?.cluster}
            objectType={MetricsObjectTypes.APP}
            direction="inbound"
          />
        )}
      </>
    );
  };

  const outboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && app && (
          <IstioMetrics
            data-test="outbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={app}
            cluster={appItem?.cluster}
            objectType={MetricsObjectTypes.APP}
            direction="outbound"
          />
        )}
      </>
    );
  };

  const handleChange = (
    _event: any,
    newValue: React.SetStateAction<number>,
  ) => {
    setValue(newValue);
  };

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView entity={props.entity} />
        <DefaultSecondaryMasthead
          elements={grids()}
          onRefresh={() => fetchApp()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="App details"
            description={<div>No App found </div>}
          />
        )}
        <div className={classes.root}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
            style={{ overflow: 'visible', borderBottom: '1px solid #dcdcdc' }}
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Inbound Metrics" {...a11yProps(1)} />
            <Tab label="Outbound Metrics" {...a11yProps(2)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            {overviewTab()}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {inboundTab()}
          </TabPanel>
          <TabPanel value={value} index={2}>
            {outboundTab()}
          </TabPanel>
        </div>
      </Content>
    </div>
  );
};
