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
import { WorkloadHealth } from '@backstage-community/plugin-kiali-common/func';
import {
  MetricsObjectTypes,
  TimeRange,
  Workload,
  WorkloadQuery,
} from '@backstage-community/plugin-kiali-common/types';
import { Content, EmptyState } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, Tab, Tabs } from '@material-ui/core';
import { default as React } from 'react';
import { useLocation } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';
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
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { WorkloadInfo } from './WorkloadInfo';
import { WorkloadPodLogs } from './WorkloadPodLogs';

export const WorkloadDetailsPage = (props: { entity?: boolean }) => {
  const path = getPath(useLocation());
  const namespace = path.namespace;
  const workload = path.item;
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [workloadItem, setWorkloadItem] = React.useState<Workload>();
  const [health, setHealth] = React.useState<WorkloadHealth>();
  const [error, setError] = React.useState<string>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const hasPods = workloadItem?.pods?.length;
  const [value, setValue] = React.useState<number>(0);
  const classes = useStyles();

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="workload-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchWorkload = async () => {
    const query: WorkloadQuery = {
      health: 'true',
      rateInterval: `${duration.toString()}s`,
      validate: 'false',
    };
    if (!namespace || !workload) {
      setError(`Could not fetch workload: Empty namespace or workload name`);
      kialiState.alertUtils?.add(
        `Could not fetch workload: Empty namespace or workload name`,
      );
      return;
    }
    kialiClient
      .getWorkload(namespace ? namespace : '', workload ? workload : '', query)
      .then((workloadResponse: Workload) => {
        setWorkloadItem(workloadResponse);

        const wkHealth = WorkloadHealth.fromJson(
          namespace ? namespace : '',
          workloadResponse.name,
          workloadResponse.health,
          {
            rateInterval: duration,
            hasSidecar: workloadResponse.istioSidecar,
            hasAmbient: workloadResponse.istioAmbient,
          },
          serverConfig,
        );
        setHealth(wkHealth);
      })
      .catch(err => {
        setError(`Could not fetch workload: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch workload: ${getErrorString(err)}`,
        );
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchWorkload();
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
        {workloadItem && (
          <WorkloadInfo
            entity={props.entity}
            workload={workloadItem}
            duration={duration}
            namespace={namespace}
            health={health}
          />
        )}
      </>
    );
  };

  const tm: TimeRange = {};
  const logsTab = (): React.ReactElement => {
    return (
      <>
        {hasPods && namespace && (
          <WorkloadPodLogs
            lastRefreshAt={duration}
            namespace={namespace}
            workload={workload ? workload : ''}
            pods={workloadItem!.pods}
            cluster={workloadItem.cluster}
            timeRange={tm}
          />
        )}
      </>
    );
  };

  const inboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && workload && (
          <IstioMetrics
            data-test="inbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={workload}
            cluster={workloadItem?.cluster}
            objectType={MetricsObjectTypes.WORKLOAD}
            direction="inbound"
          />
        )}
      </>
    );
  };

  const outboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && workload && (
          <IstioMetrics
            data-test="outbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={workload}
            cluster={workloadItem?.cluster}
            objectType={MetricsObjectTypes.WORKLOAD}
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
          onRefresh={() => fetchWorkload()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="workload details"
            description={<div>No Workload found </div>}
          />
        )}
        {error === undefined && (
          <div className={classes.root}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="simple tabs example"
              style={{ overflow: 'visible', borderBottom: '1px solid #dcdcdc' }}
            >
              <Tab label="Overview" {...a11yProps(0)} />
              <Tab label="Logs" {...a11yProps(1)} />
              <Tab label="Inbound Metrics" {...a11yProps(2)} />
              <Tab label="Outbound Metrics" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={value} index={0}>
              {overviewTab()}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {logsTab()}
            </TabPanel>
            <TabPanel value={value} index={2}>
              {inboundTab()}
            </TabPanel>
            <TabPanel value={value} index={3}>
              {outboundTab()}
            </TabPanel>
          </div>
        )}
      </Content>
    </div>
  );
};
