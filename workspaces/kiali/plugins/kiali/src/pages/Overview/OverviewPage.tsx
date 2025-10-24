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
  Health,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  nsWideMTLSStatus,
} from '@backstage-community/plugin-kiali-common/func';
import {
  DEGRADED,
  DurationInSeconds,
  FAILURE,
  HEALTHY,
  IstioMetricsOptions,
  NOT_READY,
  SortField,
} from '@backstage-community/plugin-kiali-common/types';
import { Entity } from '@backstage/catalog-model';
import {
  CardTab,
  Content,
  InfoCard,
  TabbedCard,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, Grid } from '@material-ui/core';
import _ from 'lodash';
import { default as React, useRef, useState } from 'react';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { isMultiCluster } from '../../config';
import { nsEqual } from '../../helpers/namespaces';
import { useServerConfig } from '../../hooks/useServerConfig';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { computePrometheusRateParams } from '../../services/Prometheus';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { NamespaceInfo, NamespaceInfoStatus } from './NamespaceInfo';
import { OverviewCard } from './OverviewCard';
import { switchType } from './OverviewHelper';
import {
  currentDirectionType,
  currentOverviewType,
  DirectionType,
  OverviewToolbar,
  OverviewType,
} from './OverviewToolbar';
import * as Sorts from './Sorts';

export const getNamespaces = (
  namespacesResponse: NamespaceInfo[],
  namespaces: NamespaceInfo[],
): NamespaceInfo[] => {
  return namespacesResponse.map(ns => {
    const previous = namespaces.find(prev => prev.name === ns.name);
    return {
      name: ns.name,
      cluster: ns.cluster,
      isAmbient: ns.isAmbient,
      status: previous ? previous.status : undefined,
      tlsStatus: previous ? previous.tlsStatus : undefined,
      metrics: previous ? previous.metrics : undefined,
      errorMetrics: previous ? previous.errorMetrics : undefined,
      validations: previous ? previous.validations : undefined,
      labels: ns.labels,
      annotations: ns.annotations,
      controlPlaneMetrics: previous ? previous.controlPlaneMetrics : undefined,
    };
  });
};

export const OverviewPage = (props: { entity?: Entity }) => {
  const kialiClient = useApi(kialiApiRef);
  const [errorProvider, setErrorProvider] = useState<string | undefined>(
    undefined,
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const { serverConfig } = useServerConfig();
  if (!props.entity) {
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      kialiState.providers.activeProvider,
    );
  }

  const activeNsName = kialiState.namespaces.activeNamespaces.map(
    ns => ns.name,
  );
  const activeProvider = kialiState.providers.activeProvider;
  const prevActiveProvider = useRef(activeProvider);
  const prevActiveNs = useRef(activeNsName);
  const promises = new PromisesRegistry();
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const [overviewType, setOverviewType] = React.useState<OverviewType>(
    currentOverviewType(),
  );
  const [directionType, setDirectionType] = React.useState<DirectionType>(
    currentDirectionType(),
  );
  const [activeNs, setActiveNs] = React.useState<NamespaceInfo[]>([]);

  const setHealth = (ns: NamespaceInfo, i: number) => {
    setNamespaces(prevNamespaces => {
      const newNs = [...prevNamespaces];
      newNs[i] = { ...newNs, ...ns };
      return newNs;
    });
  };

  const sortedNamespaces = (nss: NamespaceInfo[]) => {
    nss.sort((a, b) => {
      if (serverConfig && serverConfig.istioNamespace) {
        if (a.name === serverConfig.istioNamespace) return -1;
        if (b.name === serverConfig.istioNamespace) return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return nss;
  };

  const fetchHealthForCluster = async (
    namespacesInfo: NamespaceInfo[],
    cluster: string,
    durationSec: DurationInSeconds,
    type: OverviewType,
  ): Promise<void> => {
    const apiFunc = switchType(
      type,
      kialiClient.getClustersAppHealth,
      kialiClient.getClustersServiceHealth,
      kialiClient.getClustersWorkloadHealth,
    );
    const healthPromise: Promise<
      | Map<string, NamespaceAppHealth>
      | Map<string, NamespaceWorkloadHealth>
      | Map<string, NamespaceServiceHealth>
    > = apiFunc(
      namespacesInfo
        .filter(ns => ns.cluster === cluster)
        .map(ns => ns.name)
        .join(','),
      durationSec,
      cluster,
    );

    return healthPromise
      .then(results => {
        namespacesInfo.forEach((nsInfo, index) => {
          const nsStatus: NamespaceInfoStatus = {
            inNotReady: [],
            inError: [],
            inWarning: [],
            inSuccess: [],
            notAvailable: [],
          };
          if (
            ((nsInfo.cluster && nsInfo.cluster === cluster) ||
              !nsInfo.cluster) &&
            results.get(nsInfo.name)
          ) {
            const resultObj = results.get(nsInfo.name);
            // @ts-ignore
            Object.keys(resultObj).forEach(k => {
              // @ts-ignore
              const health: Health = resultObj[k];
              const status = health.getGlobalStatus();

              if (status === FAILURE) {
                nsStatus.inError.push(k);
              } else if (status === DEGRADED) {
                nsStatus.inWarning.push(k);
              } else if (status === HEALTHY) {
                nsStatus.inSuccess.push(k);
              } else if (status === NOT_READY) {
                nsStatus.inNotReady.push(k);
              } else {
                nsStatus.notAvailable.push(k);
              }
            });
            nsInfo.status = nsStatus;
            setHealth(nsInfo, index);
          }
        });
      })
      .catch(err => {
        kialiState.alertUtils!.add(
          `Could not fetch health: ${getErrorString(err)}`,
        );
      });
  };

  const filterActiveNamespaces = (nss: NamespaceInfo[]) => {
    return nss.filter(ns => activeNsName.includes(ns.name));
  };

  const fetchHealth = (
    isAscending: boolean,
    sortField: SortField<NamespaceInfo>,
    type: OverviewType,
    nsList: NamespaceInfo[],
  ) => {
    const durationCurrent = FilterHelper.currentDuration();
    const uniqueClusters = new Set<string>();
    nsList.forEach(namespace => {
      if (namespace.cluster) {
        uniqueClusters.add(namespace.cluster);
      }
    });
    uniqueClusters.forEach(cluster => {
      promises
        .registerChained('health', undefined, () =>
          fetchHealthForCluster(nsList, cluster, durationCurrent, type),
        )
        .then(() => {
          let newNamespaces = namespaces.slice();
          if (sortField.id === 'health') {
            newNamespaces = Sorts.sortFunc(
              newNamespaces,
              sortField,
              isAscending,
            );
          }
          setActiveNs(filterActiveNamespaces(newNamespaces));
          return { namespaces: newNamespaces };
        });
    });
  };

  const fetchTLSChunk = async (chunk: NamespaceInfo[]): Promise<void> => {
    return Promise.all(
      chunk.map(async nsInfo => {
        return kialiClient
          .getNamespaceTls(nsInfo.name, nsInfo.cluster)
          .then(rs => ({ status: rs, nsInfo: nsInfo }));
      }),
    )
      .then(results => {
        results.forEach(result => {
          result.nsInfo.tlsStatus = {
            status: nsWideMTLSStatus(
              result.status.status,
              kialiState.meshTLSStatus.status,
            ),
            autoMTLSEnabled: result.status.autoMTLSEnabled,
            minTLS: result.status.minTLS,
          };
        });
      })
      .catch(err =>
        kialiState.alertUtils!.add(
          `Could not fetch TLS status: ${getErrorString(err)}`,
        ),
      );
  };

  const fetchTLS = (
    nss: NamespaceInfo[],
    isAscending: boolean,
    sortField: SortField<NamespaceInfo>,
  ): void => {
    _.chunk(nss, 10).forEach(chunk => {
      promises
        .registerChained('tlschunks', undefined, () => fetchTLSChunk(chunk))
        .then(() => {
          let newNamespaces = nss.slice();
          if (sortField.id === 'mtls') {
            newNamespaces = Sorts.sortFunc(
              newNamespaces,
              sortField,
              isAscending,
            );
          }
          return newNamespaces;
        });
    });
  };

  const fetchValidationResultForCluster = async (
    nss: NamespaceInfo[],
    cluster: string,
  ) => {
    return Promise.all([
      kialiClient.getConfigValidations(cluster),
      kialiClient.getAllIstioConfigs([], true, '', '', cluster),
    ])
      .then(results => {
        nss.forEach(nsInfo => {
          if (
            nsInfo.cluster &&
            nsInfo.cluster === cluster &&
            (results[0] as any)[nsInfo.cluster]
          ) {
            // @ts-expect-error
            nsInfo.validations = results[0][nsInfo.cluster][nsInfo.name];
          }
          if (nsInfo.cluster && nsInfo.cluster === cluster) {
            // @ts-ignore
            nsInfo.istioConfig = results[1][nsInfo.name];
          }
        });
      })
      .catch(err =>
        kialiState.alertUtils!.add(
          `Could not fetch validations status: ${getErrorString(err)}`,
        ),
      );
  };

  const fetchValidations = (
    nss: NamespaceInfo[],
    isAscending: boolean,
    sortField: SortField<NamespaceInfo>,
  ) => {
    const uniqueClusters = new Set<string>();
    nss.forEach(namespace => {
      if (namespace.cluster) {
        uniqueClusters.add(namespace.cluster);
      }
    });

    uniqueClusters.forEach(cluster => {
      promises
        .registerChained('validation', undefined, () =>
          fetchValidationResultForCluster(nss, cluster),
        )
        .then(() => {
          let newNamespaces = nss.slice();
          if (sortField.id === 'validations') {
            newNamespaces = Sorts.sortFunc(
              newNamespaces,
              sortField,
              isAscending,
            );
          }
          return newNamespaces;
        });
    });
  };

  const fetchMetricsChunk = async (chunk: NamespaceInfo[]) => {
    const rateParams = computePrometheusRateParams(duration, 10);
    const options: IstioMetricsOptions = {
      filters: ['request_count', 'request_error_count'],
      duration: duration,
      step: rateParams.step,
      rateInterval: rateParams.rateInterval,
      direction: directionType,
      reporter: directionType === 'inbound' ? 'destination' : 'source',
    };
    return Promise.all(
      chunk.map(nsInfo => {
        if (nsInfo.cluster && isMultiCluster) {
          options.clusterName = nsInfo.cluster;
        }
        return kialiClient
          .getNamespaceMetrics(nsInfo.name, options)
          .then(rs => {
            nsInfo.metrics = rs.request_count;
            nsInfo.errorMetrics = rs.request_error_count;
            if (
              serverConfig &&
              serverConfig.istioNamespace &&
              nsInfo.name === serverConfig.istioNamespace
            ) {
              nsInfo.controlPlaneMetrics = {
                istiod_proxy_time: rs.pilot_proxy_convergence_time,
                istiod_container_cpu: rs.container_cpu_usage_seconds_total,
                istiod_container_mem: rs.container_memory_working_set_bytes,
                istiod_process_cpu: rs.process_cpu_seconds_total,
                istiod_process_mem: rs.process_resident_memory_bytes,
              };
            }
            return nsInfo;
          });
      }),
    ).catch(err =>
      kialiState.alertUtils!.add(
        `Could not fetch metrics: ${getErrorString(err)}`,
      ),
    );
  };

  const fetchMetrics = async (nss: NamespaceInfo[]) => {
    // debounce async for back-pressure, ten by ten
    _.chunk(nss, 10).forEach(chunk => {
      promises
        .registerChained('metricschunks', undefined, () =>
          fetchMetricsChunk(chunk),
        )
        .then(() => {
          nss.slice();
          setActiveNs(filterActiveNamespaces(nss));
        });
    });
  };

  const load = async () => {
    if (props.entity) {
      if (props.entity?.metadata.annotations?.[KIALI_PROVIDER]) {
        kialiClient.setAnnotation(
          KIALI_PROVIDER,
          props.entity?.metadata.annotations?.[KIALI_PROVIDER],
        );
      }
    } else {
      kialiClient.setAnnotation(
        KIALI_PROVIDER,
        kialiState.providers.activeProvider,
      );
    }

    await kialiClient
      .getNamespaces()
      .then(namespacesResponse => {
        const allNamespaces: NamespaceInfo[] = getNamespaces(
          namespacesResponse,
          namespaces,
        );

        // Calculate information
        const isAscending = FilterHelper.isCurrentSortAscending();
        const sortField = FilterHelper.currentSortField(Sorts.sortFields);
        const sortNs = sortedNamespaces(allNamespaces);

        fetchHealth(isAscending, sortField, overviewType, sortNs);
        fetchTLS(sortNs, isAscending, sortField);
        fetchValidations(sortNs, isAscending, sortField);
        fetchMetrics(sortNs);
        setNamespaces(sortNs);
        promises.waitAll();
      })
      .catch(error => {
        setErrorProvider(
          `Error providing namespaces for ${
            kialiState.providers.activeProvider
          }, verify configuration for this provider: ${error.toString()}`,
        );
      });
  };

  React.useEffect(() => {
    if (
      !nsEqual(activeNsName, prevActiveNs.current) ||
      activeProvider !== prevActiveProvider.current
    ) {
      setErrorProvider(undefined);
      prevActiveNs.current = activeNsName;
      prevActiveProvider.current = activeProvider;
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNsName, activeProvider]);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, overviewType, directionType]);

  if (namespaces.length === 0) {
    return <CircularProgress />;
  }

  return (
    <>
      {props.entity ? (
        <div style={{ marginBottom: '20px', marginRight: '20px' }}>
          <TabbedCard title="Overview">
            {namespaces.map(ns => (
              <CardTab label={ns.name} key={`card_ns_${ns.name}`}>
                <OverviewCard
                  entity
                  namespace={ns}
                  istioAPIEnabled={
                    kialiState.statusState.istioEnvironment.istioAPIEnabled
                  }
                  type={overviewType}
                  direction={directionType}
                  duration={duration}
                  refreshInterval={kialiState.userSettings.refreshInterval}
                  certsInfo={kialiState.istioCertsInfo}
                  minTLS={kialiState.meshTLSStatus.minTLS}
                  istioStatus={kialiState.istioStatus}
                />
              </CardTab>
            ))}
          </TabbedCard>
        </div>
      ) : (
        <div className={baseStyle}>
          <Content>
            {errorProvider ? (
              <InfoCard>{errorProvider}</InfoCard>
            ) : (
              <>
                <OverviewToolbar
                  onRefresh={() => load()}
                  overviewType={overviewType}
                  setOverviewType={setOverviewType}
                  directionType={directionType}
                  setDirectionType={setDirectionType}
                  duration={duration}
                  setDuration={setDuration}
                />
                <Grid container spacing={2}>
                  {activeNs.map((ns, i) => (
                    <Grid
                      key={`Card_${ns.name}_${i}`}
                      item
                      xs={
                        serverConfig &&
                        serverConfig.istioNamespace &&
                        ns.name === serverConfig.istioNamespace
                          ? 12
                          : 4
                      }
                    >
                      <OverviewCard
                        namespace={ns}
                        istioAPIEnabled={
                          kialiState.statusState.istioEnvironment
                            .istioAPIEnabled
                        }
                        type={overviewType}
                        direction={directionType}
                        duration={duration}
                        refreshInterval={
                          kialiState.userSettings.refreshInterval
                        }
                        certsInfo={kialiState.istioCertsInfo}
                        minTLS={kialiState.meshTLSStatus.minTLS}
                        istioStatus={kialiState.istioStatus}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Content>
        </div>
      )}
    </>
  );
};
