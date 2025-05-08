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
import type { AppListItem } from '@backstage-community/plugin-kiali-common/types';
import { DRAWER, ENTITY } from '@backstage-community/plugin-kiali-common/types';
import { Entity } from '@backstage/catalog-model';
import { Content, InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { default as React, useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';
import * as AppListClass from './AppListClass';

export const AppListPage = (props: {
  view?: string;
  entity?: Entity;
}): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [errorProvider, setErrorProvider] = React.useState<string | undefined>(
    undefined,
  );
  const [allApps, setApps] = React.useState<AppListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  kialiClient.setAnnotation(
    KIALI_PROVIDER,
    props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
      kialiState.providers.activeProvider,
  );
  const activeNs = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const activeProvider =
    props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
    kialiState.providers.activeProvider;
  const prevActiveProvider = useRef(activeProvider);
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
        id="app-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchApps = async (
    clusters: string[],
    timeDuration: number,
  ): Promise<void> => {
    const health = 'true';
    const istioResources = 'true';
    return Promise.all(
      clusters.map(async cluster => {
        return await kialiClient.getClustersApps(
          activeNs.map(ns => ns).join(','),
          {
            rateInterval: `${String(timeDuration)}s`,
            health: health,
            istioResources: istioResources,
          },
          cluster,
        );
      }),
    )
      .then(results => {
        let appListItems: AppListItem[] = [];

        results.forEach(response => {
          appListItems = appListItems.concat(
            AppListClass.getAppItems(response, timeDuration),
          );
        });
        setApps(appListItems);
      })
      .catch(err =>
        kialiState.alertUtils?.add(
          `Could not fetch services: ${getErrorString(err)}`,
        ),
      );
  };

  const getNS = async () => {
    const serverConfig = await kialiClient.getServerConfig();
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
        kialiState.providers.activeProvider,
    );
    kialiClient
      .getNamespaces()
      .then(namespacesResponse => {
        const uniqueClusters = new Set<string>();
        Object.keys(serverConfig.clusters).forEach(cluster => {
          uniqueClusters.add(cluster);
        });
        const allNamespaces: NamespaceInfo[] = getNamespaces(
          namespacesResponse,
          namespaces,
        );
        const namespaceInfos = allNamespaces.filter(ns =>
          activeNs.includes(ns.name),
        );
        setNamespaces(namespaceInfos);
        fetchApps(Array.from(uniqueClusters), duration);
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

  const [_, refresh] = useAsyncFn(
    async () => {
      await getNS();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 5);

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current) ||
      activeProvider !== prevActiveProvider.current
    ) {
      setErrorProvider(undefined);
      setLoading(true);
      getNS();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
      prevActiveProvider.current = activeProvider;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration, activeProvider]);

  const appContent = () => {
    return errorProvider ? (
      <InfoCard>{errorProvider}</InfoCard>
    ) : (
      <>
        {props.view !== ENTITY && (
          <DefaultSecondaryMasthead
            elements={grids()}
            onRefresh={() => getNS()}
          />
        )}

        <VirtualList
          activeNamespaces={namespaces}
          rows={allApps}
          type="applications"
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
        <Content>{appContent()}</Content>
      )}
      {(props.view === ENTITY || props.view === DRAWER) && (
        <div style={{ paddingRight: '10px', paddingLeft: '10px' }}>
          {appContent()}
        </div>
      )}
    </div>
  );
};
