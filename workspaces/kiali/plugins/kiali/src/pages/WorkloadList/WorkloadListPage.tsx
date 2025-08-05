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
  validationKey,
  WorkloadHealth,
} from '@backstage-community/plugin-kiali-common/func';
import {
  ClusterWorkloadsResponse,
  DRAWER,
  ENTITY,
  WorkloadListItem,
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
import { isMultiCluster, serverConfig } from '../../config';
import { useKialiEntityContext } from '../../dynamic/KialiContext';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { hasMissingAuthPolicy } from '../../utils/IstioConfigUtils';
import { sortIstioReferences } from '../AppList/FiltersAndSorts';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const WorkloadListPage = (props: { view?: string; entity?: Entity }) => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allWorkloads, setWorkloads] = React.useState<WorkloadListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [errorProvider, setErrorProvider] = React.useState<string | undefined>(
    undefined,
  );
  const kialiContext = useKialiEntityContext();

  const activeNs = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const activeProviders =
    props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
    kialiState.providers.activeProvider;
  const prevActiveProvider = useRef(activeProviders);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);
  const [loadingData, setLoadingData] = React.useState<boolean>(true);

  const getDeploymentItems = (
    data: ClusterWorkloadsResponse,
  ): WorkloadListItem[] => {
    if (data.workloads) {
      return data.workloads.map(deployment => ({
        cluster: deployment.cluster,
        namespace: deployment.namespace,
        name: deployment.name,
        type: deployment.type,
        appLabel: deployment.appLabel,
        versionLabel: deployment.versionLabel,
        istioSidecar: deployment.istioSidecar,
        istioAmbient: deployment.istioAmbient,
        additionalDetailSample: deployment.additionalDetailSample,
        health: WorkloadHealth.fromJson(
          deployment.namespace,
          deployment.name,
          deployment.health,
          {
            rateInterval: duration,
            hasSidecar: deployment.istioSidecar,
            hasAmbient: deployment.istioAmbient,
          },
          serverConfig,
        ),
        labels: deployment.labels,
        istioReferences: sortIstioReferences(deployment.istioReferences, true),
        notCoveredAuthPolicy: hasMissingAuthPolicy(
          validationKey(deployment.name, deployment.namespace),
          data.validations,
        ),
      }));
    }

    return [];
  };

  const fetchWorkloads = (
    clusters: string[],
    timeDuration: number,
  ): Promise<void> => {
    return Promise.all(
      clusters.map(cluster => {
        return kialiClient
          .getClustersWorkloads(
            activeNs.map(nss => nss).join(','),
            {
              health: 'true',
              istioResources: 'true',
              rateInterval: `${String(timeDuration)}s`,
            },
            cluster,
          )
          .then(workloadsResponse => {
            return workloadsResponse;
          });
      }),
    )
      .then(results => {
        let workloadsItems: WorkloadListItem[] = [];
        results.forEach(response => {
          workloadsItems = workloadsItems.concat(getDeploymentItems(response));
        });
        setWorkloads(workloadsItems);
      })
      .catch(err => {
        kialiState.alertUtils?.add(
          `Could not fetch workloads: ${getErrorString(err)}`,
        );
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
    if (kialiContext.data) {
      setNamespaces(kialiContext.data);
      await fetchWorkloads(Array.from(uniqueClusters), duration);
    } else {
      kialiClient
        .getNamespaces()
        .then(namespacesResponse => {
          const allNamespaces: NamespaceInfo[] = getNamespaces(
            namespacesResponse,
            namespaces,
          );
          const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
          setNamespaces(nsl);
          fetchWorkloads(Array.from(uniqueClusters), duration);
        })
        .catch(err => {
          setErrorProvider(
            `Error providing namespaces for ${
              kialiState.providers.activeProvider
            }, verify configuration for this provider: ${err.toString()}`,
          );
        });
    }

    // Add a delay so it doesn't look like a flash
    setTimeout(() => {
      setLoadingData(false);
    }, 400);
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await load();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current) ||
      activeProviders !== prevActiveProvider.current
    ) {
      setErrorProvider(undefined);
      setLoadingData(true);
      load();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
      prevActiveProvider.current = activeProviders;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration, activeProviders]);

  if (loading) {
    return <CircularProgress />;
  }

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];
  if (props.view === ENTITY) {
    hiddenColumns.push('details');
  }

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

  const mainContent = () => {
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
          rows={allWorkloads}
          type="workloads"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingData}
          data-test="virtual-list"
        />
      </>
    );
  };

  return (
    <div className={baseStyle}>
      {props.view !== ENTITY && props.view !== DRAWER && (
        <Content>{mainContent()}</Content>
      )}
      {(props.view === ENTITY || props.view === DRAWER) && (
        <div style={{ paddingRight: '10px', paddingLeft: '10px' }}>
          {mainContent()}
        </div>
      )}
    </div>
  );
};
