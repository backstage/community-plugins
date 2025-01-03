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
import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { nsEqual } from '../../helpers/namespaces';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { IstioConfigItem, toIstioItems } from '../../types/IstioConfigList';
import { NamespaceInfo } from '../../types/NamespaceInfo';
import { ENTITY } from '../../types/types';
import { getNamespaces } from '../Overview/OverviewPage';

export const IstioConfigListPage = (props: {
  view?: string;
}): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allIstioConfigs, setIstioConfigs] = React.useState<IstioConfigItem[]>(
    [],
  );
  const activeNs = kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = React.useRef(activeNs);
  const [loadingD, setLoading] = React.useState<boolean>(true);

  const fetchIstioConfigs = async (nss: NamespaceInfo[]): Promise<void> => {
    return kialiClient
      .getAllIstioConfigs(
        nss.map(ns => {
          return ns.name;
        }),
        [],
        true,
        '',
        '',
      )
      .then(results => {
        let istioItems: IstioConfigItem[] = [];

        nss.forEach(ns => {
          istioItems = istioItems.concat(toIstioItems(results[ns.name]));
        });

        setIstioConfigs(istioItems);
      });
  };

  const load = async () => {
    kialiClient.getNamespaces().then(namespacesResponse => {
      const allNamespaces: NamespaceInfo[] = getNamespaces(
        namespacesResponse,
        namespaces,
      );
      const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
      setNamespaces(nsl);
      fetchIstioConfigs(nsl);
    });
    setTimeout(() => {
      setLoading(false);
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
    if (!nsEqual(activeNs, prevActiveNs.current)) {
      setLoading(true);
      load();
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs]);

  if (loading) {
    return <CircularProgress />;
  }

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];

  return (
    <div className={baseStyle}>
      <Content>
        {props.view !== ENTITY && (
          <DefaultSecondaryMasthead elements={[]} onRefresh={() => load()} />
        )}
        <VirtualList
          activeNamespaces={namespaces}
          rows={allIstioConfigs}
          type="istio"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingD}
        />
      </Content>
    </div>
  );
};
