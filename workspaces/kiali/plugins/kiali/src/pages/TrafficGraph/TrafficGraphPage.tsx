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
import { Model, Visualization } from '@patternfly/react-topology';
import { default as React, useRef, useState } from 'react';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getEntityNs } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { KialiComponentFactory } from './factories/KialiComponentFactory';
import { KialiLayoutFactory } from './factories/KialiLayoutFactory';
import { decorateGraphData } from './util/GraphDecorator';
import { generateDataModel } from './util/GraphGenerator';

const graphStyle = kialiStyle({
  height: '93%',
});

const graphConfig = {
  id: 'g1',
  type: 'graph',
  layout: 'Dagre',
};

const getVisualization = (): Visualization => {
  const vis = new Visualization();

  vis.registerLayoutFactory(KialiLayoutFactory);
  vis.registerComponentFactory(KialiComponentFactory);
  vis.setFitToScreenOnLayout(true);

  return vis;
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
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [errorProvider, setErrorProvider] = React.useState<string | undefined>(
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

  const activeNamespaces = getNamespaces(props.entity, kialiState);
  const activeProvider = getProvider(props.entity, kialiState);
  const prevProvider = useRef<string | undefined>(undefined);
  const prevActiveNs = useRef<string[]>([]);
  const prevDuration = useRef<number | undefined>(undefined);

  const [model, setModel] = useState<Model>({
    nodes: [],
    edges: [],
    graph: graphConfig,
  });

  const [controller] = useState(getVisualization());

  const fetchGraph = async () => {
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      props.entity?.metadata.annotations?.[KIALI_PROVIDER] ||
        kialiState.providers.activeProvider,
    );
    if (activeNamespaces.length === 0) {
      setModel({
        nodes: [],
        edges: [],
        graph: graphConfig,
      });
      return;
    }

    const graphQueryElements = {
      appenders: 'health,deadNode,istio,serviceEntry,meshCheck,workloadEntry',
      activeNamespaces: activeNamespaces.join(','),
      namespaces: activeNamespaces.join(','),
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
      const data = await kialiClient
        .getGraphElements(graphQueryElements)
        .then(response => {
          if ('verify' in response) {
            setErrorProvider(
              `Error providing namespaces for ${activeProvider}, verify configuration for this provider: ${response.verify}`,
            );
            return { elements: [], duration: 0 };
          }
          return response;
        })
        .catch(error => {
          setErrorProvider(error.toString());
          return null;
        });

      if (data) {
        const graphData = decorateGraphData(
          (data as GraphDefinition).elements,
          (data as GraphDefinition).duration,
        );
        const g = generateDataModel(graphData, graphQueryElements);
        setModel({
          nodes: g.nodes,
          edges: g.edges,
          graph: graphConfig,
        });
      } else {
        // If data is null, keep the previous model
        // Don't clear it to avoid showing empty graph
      }
    } catch (error: any) {
      kialiState.alertUtils?.add(
        `Could not fetch services: ${getErrorString(error)}`,
      );
      // Don't clear the model on error, keep the previous one
    }
  };

  const timeDuration = (
    <TimeDurationComponent
      key="DurationDropdown"
      id="graph-duration-dropdown"
      disabled={false}
      duration={duration.toString()}
      setDuration={setDuration}
      label="From:"
    />
  );

  const [loading, setLoading] = React.useState(true);
  const lastFetchedKey = React.useRef<string>('');

  React.useEffect(() => {
    const namespacesKey = activeNamespaces.join(',');
    const currentKey = `${namespacesKey}|${duration}|${activeProvider}`;

    if (activeNamespaces.length === 0) {
      // Namespaces are empty - clear model and stop loading
      setModel({ nodes: [], edges: [], graph: graphConfig });
      setLoading(false);
      lastFetchedKey.current = currentKey;
    } else {
      // Check if we need to fetch
      const keyChanged = currentKey !== lastFetchedKey.current;
      const modelIsEmpty =
        (model.nodes?.length ?? 0) === 0 && (model.edges?.length ?? 0) === 0;
      // Fetch if key changed, or if key matches but model is empty (component remounted)
      const needsFetch =
        keyChanged || (currentKey === lastFetchedKey.current && modelIsEmpty);

      if (needsFetch) {
        setErrorProvider(undefined);
        setLoading(true);
        fetchGraph().finally(() => {
          setLoading(false);
          lastFetchedKey.current = currentKey;
        });
      }
    }

    // Update refs
    prevDuration.current = duration;
    prevActiveNs.current = activeNamespaces;
    prevProvider.current = activeProvider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNamespaces, duration, activeProvider]);

  React.useEffect(() => {
    // Only update the controller if the model has nodes or edges
    if ((model.nodes?.length ?? 0) > 0 || (model.edges?.length ?? 0) > 0) {
      controller.fromModel(model, false);
    }
  }, [model, controller]);

  const refresh = React.useCallback(async () => {
    if (activeNamespaces.length === 0) {
      return;
    }
    setLoading(true);
    setErrorProvider(undefined);
    // Force refresh by clearing the key
    lastFetchedKey.current = '';
    try {
      await fetchGraph();
      const currentKey = `${activeNamespaces.join(
        ',',
      )}|${duration}|${activeProvider}`;
      lastFetchedKey.current = currentKey;
    } catch (error) {
      // Error is already handled in fetchGraph
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNamespaces, duration, activeProvider]);

  if (loading) {
    return <CircularProgress />;
  }

  // Don't show anything if no namespaces are selected
  if (activeNamespaces.length === 0) {
    return null;
  }

  // Don't show graph if model is empty (no nodes or edges)
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
              elements={[timeDuration]}
              onRefresh={refresh}
            />
          )}
          {hasGraphData ? <TrafficGraph model={model} /> : null}
        </>
      )}
    </Content>
  );
}

export default TrafficGraphPage;
