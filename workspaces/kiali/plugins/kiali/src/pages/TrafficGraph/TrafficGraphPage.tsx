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
  EdgeLabelMode,
  ENTITY,
  GraphDefinition,
  GraphType,
  TrafficRate,
} from '@backstage-community/plugin-kiali-common/types';
import { TrafficGraph } from '@backstage-community/plugin-kiali-react';
import { Entity } from '@backstage/catalog-model';
import { Content, InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, useTheme } from '@material-ui/core';
import { Model } from '@patternfly/react-topology';
import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getEntityNs } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { decorateGraphData } from './util/GraphDecorator';
import { generateDataModel } from './util/GraphGenerator';

const graphStyle = kialiStyle({
  height: '93%',
});

const graphConfig = {
  id: 'g1',
  type: 'graph',
  // Use Dagre for the initial layout (clean/structured). Nodes are still draggable after render.
  layout: 'Dagre',
};

const getNamespaces = (
  entity: Entity | undefined,
  kialiState: KialiAppState,
) => {
  if (entity) {
    return getEntityNs(entity);
  }
  return kialiState.namespaces.activeNamespaces.map(ns => ns.name);
};

const getProvider = (entity: Entity | undefined, kialiState: KialiAppState) => {
  return entity?.metadata?.annotations
    ? entity.metadata.annotations[KIALI_PROVIDER]
    : kialiState.providers.activeProvider;
};
function TrafficGraphPage(props: { view?: string; entity?: Entity }) {
  const kialiState = useContext(KialiContext) as KialiAppState;
  const [errorProvider, setErrorProvider] = useState<string | undefined>(
    undefined,
  );
  const kialiClient = useApi(kialiApiRef);
  const theme = useTheme();

  const htmlElement = document.getElementsByTagName('html')[0];
  if (htmlElement) {
    if (theme.palette.type === 'dark') {
      htmlElement.classList.add('pf-v6-theme-dark');
    } else {
      htmlElement.classList.remove('pf-v6-theme-dark');
    }
  }

  const [duration, setDuration] = useState(FilterHelper.currentDuration());
  const [model, setModel] = useState<Model>({
    nodes: [],
    edges: [],
    graph: graphConfig,
  });
  const [loading, setLoading] = useState(true);

  // Memoize to prevent unnecessary re-renders
  const activeNamespaces = useMemo(
    () => getNamespaces(props.entity, kialiState),
    [props.entity, kialiState],
  );
  const activeProvider = useMemo(
    () => getProvider(props.entity, kialiState),
    [props.entity, kialiState],
  );

  const lastFetchedKey = useRef<string>('');

  const fetchGraph = useCallback(async () => {
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
        kialiState.providers.activeProvider,
    );

    if (activeNamespaces.length === 0) {
      setModel({ nodes: [], edges: [], graph: graphConfig });
      return;
    }

    const graphQueryElements = {
      appenders: 'health,deadNode,istio,serviceEntry,meshCheck,workloadEntry',
      activeNamespaces: activeNamespaces.join(','),
      namespaces: activeNamespaces.join(','),
      // Kiali graph API expects duration (e.g. "600s"). This makes the "From: 10m" dropdown actually affect the graph.
      duration: `${duration}s`,
      graphType: GraphType.VERSIONED_APP,
      injectServiceNodes: true,
      boxByNamespace: true,
      boxByCluster: true,
      showOutOfMesh: false,
      showSecurity: false,
      showVirtualServices: false,
      edgeLabels: [
        EdgeLabelMode.TRAFFIC_RATE,
        EdgeLabelMode.TRAFFIC_DISTRIBUTION,
      ],
      trafficRates: [
        TrafficRate.HTTP_REQUEST,
        TrafficRate.GRPC_TOTAL,
        TrafficRate.TCP_TOTAL,
      ],
    };

    try {
      const response = await kialiClient.getGraphElements(graphQueryElements);

      if ('verify' in response) {
        setErrorProvider(
          `Error providing namespaces for ${activeProvider}, verify configuration for this provider: ${response.verify}`,
        );
        return;
      }

      const graphData = decorateGraphData(
        (response as GraphDefinition).elements,
        (response as GraphDefinition).duration,
      );
      const g = generateDataModel(graphData, graphQueryElements);
      setModel({
        nodes: g.nodes,
        edges: g.edges,
        graph: graphConfig,
      });
    } catch (error: any) {
      setErrorProvider(error.toString());
      kialiState.alertUtils?.add(
        `Could not fetch services: ${getErrorString(error)}`,
      );
    }
  }, [
    activeNamespaces,
    activeProvider,
    duration,
    props.entity,
    kialiClient,
    kialiState,
  ]);

  // Fetch graph when dependencies change
  useEffect(() => {
    const currentKey = `${activeNamespaces.join(',')}|${duration}|${activeProvider}`;

    // Skip if already fetched with same key
    if (currentKey === lastFetchedKey.current) {
      return;
    }

    lastFetchedKey.current = currentKey;
    setErrorProvider(undefined);
    setLoading(true);

    fetchGraph().finally(() => {
      setLoading(false);
    });
  }, [activeNamespaces, duration, activeProvider, fetchGraph]);

  const refresh = useCallback(async () => {
    lastFetchedKey.current = '';
    setLoading(true);
    setErrorProvider(undefined);
    await fetchGraph();
    setLoading(false);
  }, [fetchGraph]);

  if (loading) {
    return <CircularProgress />;
  }

  // Don't show anything if no namespaces are selected
  if (activeNamespaces.length === 0) {
    return null;
  }

  const hasGraphData =
    (model.nodes?.length ?? 0) > 0 || (model.edges?.length ?? 0) > 0;

  return (
    <Content className={graphStyle} data-test="kiali-graph-card">
      {errorProvider ? (
        <InfoCard>{errorProvider}</InfoCard>
      ) : (
        <>
          {props.view !== ENTITY && (
            <DefaultSecondaryMasthead
              elements={[
                <TimeDurationComponent
                  key="DurationDropdown"
                  id="graph-duration-dropdown"
                  disabled={false}
                  duration={duration.toString()}
                  setDuration={setDuration}
                  label="From:"
                />,
              ]}
              onRefresh={refresh}
            />
          )}
          {hasGraphData && <TrafficGraph model={model} />}
        </>
      )}
    </Content>
  );
}

export default TrafficGraphPage;
