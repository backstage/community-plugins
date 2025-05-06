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
  Gateway,
  K8sGateway,
  MetricsObjectTypes,
  PeerAuthentication,
  ServiceDetailsInfo,
  Validations,
} from '@backstage-community/plugin-kiali-common/types';
import { Content, EmptyState } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, Tab, Tabs } from '@material-ui/core';
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
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiContext } from '../../store';
import { KialiAppState } from '../../store/Store';
import { baseStyle } from '../../styles/StyleUtils';
import { ServiceInfo } from './ServiceInfo';

export const ServiceDetailsPage = (props: { entity?: boolean }) => {
  const path = getPath(useLocation());
  const namespace = path.namespace;
  const service = path.item;
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [serviceItem, setServiceItem] = React.useState<ServiceDetailsInfo>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const cluster = HistoryManager.getClusterName();
  const [validations, setValidations] = React.useState<Validations>();
  const [gateways, setGateways] = React.useState<Gateway[]>([]);
  const [k8sGateways, setK8sGateways] = React.useState<K8sGateway[]>([]);
  const [error, setError] = React.useState<string>();
  const [peerAuthentication, setPeerAuthentication] = React.useState<
    PeerAuthentication[]
  >([]);
  const [value, setValue] = React.useState<number>(0);
  const classes = useStyles();

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="service-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchIstioObjects = async () => {
    kialiClient
      .getAllIstioConfigs([], true, '', '', cluster)
      .then(response => {
        const gws: Gateway[] = [];
        const k8sGws: K8sGateway[] = [];
        const peer: PeerAuthentication[] = [];
        Object.values(response).forEach(item => {
          gws.push(...item.gateways);
          k8sGws.push(...item.k8sGateways);
          peer.push(...item.peerAuthentication);
        });
        setGateways(gws);
        setK8sGateways(k8sGws);
        setPeerAuthentication(peer);
      })
      .catch(gwError => {
        kialiState.alertUtils!.add(
          `Could not fetch Gateways list: ${getErrorString(gwError)}`,
        );
      });
  };

  const fetchService = async () => {
    if (!namespace || !service) {
      setError(`Could not fetch service: Empty namespace or service name`);
      kialiState.alertUtils?.add(
        `Could not fetch service: Empty namespace or service name`,
      );
      return;
    }

    kialiClient
      .getServiceDetail(
        namespace ? namespace : '',
        service ? service : '',
        true,
        cluster,
        duration,
      )
      .then((serviceResponse: ServiceDetailsInfo) => {
        setServiceItem(serviceResponse);
        setValidations(serviceResponse.validations);
        fetchIstioObjects();
      })
      .catch(err => {
        setError(`Could not fetch service: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch service: ${getErrorString(err)}`,
        );
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchService();
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
        {serviceItem && (
          <ServiceInfo
            service={service ? service : ''}
            duration={duration}
            namespace={namespace ? namespace : ''}
            validations={validations ? validations : {}}
            cluster={cluster}
            serviceDetails={serviceItem}
            gateways={gateways}
            k8sGateways={k8sGateways}
            peerAuthentications={peerAuthentication}
            istioAPIEnabled
          />
        )}
      </>
    );
  };

  const inboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && service && (
          <IstioMetrics
            data-test="inbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={service}
            cluster={cluster}
            objectType={MetricsObjectTypes.SERVICE}
            direction="inbound"
          />
        )}
      </>
    );
  };

  const outboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && service && (
          <IstioMetrics
            data-test="outbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={service}
            cluster={cluster}
            objectType={MetricsObjectTypes.SERVICE}
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
          onRefresh={() => fetchService()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="Service details"
            description={<div>No Service found </div>}
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
