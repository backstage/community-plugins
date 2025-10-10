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
import { KIALI_PROVIDER } from '@backstage-community/plugin-kiali-common';
import {
  ServiceHealth,
  validationKey,
} from '@backstage-community/plugin-kiali-common/func';
import {
  DRAWER,
  ENTITY,
  ObjectValidation,
  ServiceList,
  ServiceListItem,
  Validations,
} from '@backstage-community/plugin-kiali-common/types';
import { Entity } from '@backstage/catalog-model';
import { Content, InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import { default as React, useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { useServerConfig } from '../../hooks/useServerConfig';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { sortIstioReferences } from '../AppList/FiltersAndSorts';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const ServiceListPage = (props: {
  view?: string;
  entity?: Entity;
}): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [errorProvider, setErrorProvider] = React.useState<string | undefined>(
    undefined,
  );
  const [allServices, setServices] = React.useState<ServiceListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const { serverConfig } = useServerConfig();
  kialiClient.setAnnotation(
    KIALI_PROVIDER,
    props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
      kialiState.providers.activeProvider,
  );
  const activeNs = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const activeProviders =
    props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
    kialiState.providers.activeProvider;
  const prevActiveProvider = useRef(activeProviders);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);
  const [loadingD, setLoading] = React.useState<boolean>(true);

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];
  if (props.view === ENTITY) {
    hiddenColumns.push('details');
  }

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

  const getServiceValidation = (
    name: string,
    namespace: string,
    validations: Validations,
  ): ObjectValidation | undefined => {
    const type = 'service'; // Using 'service' directly is disallowed

    if (
      validations[type] &&
      validations[type][validationKey(name, namespace)]
    ) {
      return validations[type][validationKey(name, namespace)];
    }

    return undefined;
  };

  const getServiceItem = (
    data: ServiceList,
    rateInterval: number,
  ): ServiceListItem[] => {
    if (data.services) {
      return data.services.map(service => ({
        name: service.name,
        istioSidecar: service.istioSidecar,
        istioAmbient: service.istioAmbient,
        namespace: service.namespace,
        cluster: service.cluster,
        health: ServiceHealth.fromJson(
          service.namespace,
          service.name,
          service.health,
          {
            rateInterval: rateInterval,
            hasSidecar: service.istioSidecar,
            hasAmbient: service.istioAmbient,
          },
          serverConfig,
        ),
        validation: getServiceValidation(
          service.name,
          service.namespace,
          data.validations,
        ),
        additionalDetailSample: service.additionalDetailSample,
        labels: service.labels ?? {},
        ports: service.ports ?? {},
        istioReferences: sortIstioReferences(service.istioReferences, true),
        kialiWizard: service.kialiWizard,
        serviceRegistry: service.serviceRegistry,
      }));
    }

    return [];
  };

  const fetchServices = async (
    clusters: string[],
    timeDuration: number,
  ): Promise<void> => {
    const health = 'true';
    const istioResources = 'true';
    const onlyDefinitions = 'false';
    return Promise.all(
      clusters.map(async cluster => {
        return await kialiClient.getClustersServices(
          activeNs.map(ns => ns).join(','),
          {
            rateInterval: `${String(timeDuration)}s`,
            health: health,
            istioResources: istioResources,
            onlyDefinitions: onlyDefinitions,
          },
          cluster,
        );
      }),
    ).then(results => {
      let serviceListItems: ServiceListItem[] = [];

      results.forEach(response => {
        serviceListItems = serviceListItems.concat(
          getServiceItem(response as ServiceList, duration),
        );
      });
      setServices(serviceListItems);
    });
  };

  const load = async () => {
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
        kialiState.providers.activeProvider,
    );

    const uniqueClusters = new Set<string>();
    Object.keys(serverConfig.clusters).forEach(cluster => {
      uniqueClusters.add(cluster);
    });
    kialiClient
      .getNamespaces()
      .then(namespacesResponse => {
        const allNamespaces: NamespaceInfo[] = getNamespaces(
          namespacesResponse,
          namespaces,
        );
        const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
        setNamespaces(nsl);
        fetchServices(Array.from(uniqueClusters), duration);
      })
      .catch(err =>
        setErrorProvider(
          `Error providing namespaces for ${
            kialiState.providers.activeProvider
          }, verify configuration for this provider: ${err.toString()}`,
        ),
      );
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current) ||
      activeProviders !== prevActiveProvider.current
    ) {
      setErrorProvider(undefined);
      setLoading(true);
      load();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
      prevActiveProvider.current = activeProviders;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration, activeProviders]);

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await load();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  const serviceContent = () => {
    return errorProvider ? (
      <InfoCard>{errorProvider}</InfoCard>
    ) : (
      <>
        {props.view !== ENTITY && (
          <DefaultSecondaryMasthead
            elements={grids()}
            onRefresh={() => load()}
          />
        )}

        <VirtualList
          activeNamespaces={namespaces}
          rows={allServices}
          type="services"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingD}
        />
      </>
    );
  };

  return (
    <div className={baseStyle}>
      {props.view !== ENTITY && props.view !== DRAWER && (
        <Content>{serviceContent()}</Content>
      )}
      {(props.view === ENTITY || props.view === DRAWER) && (
        <div style={{ paddingRight: '10px', paddingLeft: '10px' }}>
          {serviceContent()}
        </div>
      )}
    </div>
  );
};
