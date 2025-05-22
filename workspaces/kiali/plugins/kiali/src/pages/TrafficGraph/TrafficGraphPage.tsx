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
import { useAsyncFn, useDebounce } from 'react-use';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
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
      htmlElement.classList.add('pf-v5-theme-dark');
    } else {
      htmlElement.classList.remove('pf-v5-theme-dark');
    }
  }

  const [duration, setDuration] = useState(FilterHelper.currentDuration());

  const activeNamespaces = getNamespaces(props.entity, kialiState);
  const activeProvider = getProvider(props.entity, kialiState);
  const prevProvider = useRef(activeProvider);
  const prevActiveNs = useRef(activeNamespaces);
  const prevDuration = useRef(duration);

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
        .catch(error => setErrorProvider(error.toString()));
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
    } catch (error: any) {
      kialiState.alertUtils?.add(
        `Could not fetch services: ${getErrorString(error)}`,
      );
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

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNamespaces, prevActiveNs.current) ||
      activeProvider !== prevProvider.current
    ) {
      setErrorProvider(undefined);
      fetchGraph();
      prevDuration.current = duration;
      prevActiveNs.current = activeNamespaces;
      prevProvider.current = activeProvider;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNamespaces, duration, activeProvider]);

  React.useEffect(() => {
    controller.fromModel(model, false);
  }, [model, controller]);

  const [state, refresh] = useAsyncFn(
    async () => {
      await fetchGraph();
    },
    [],
    { loading: true },
  );

  useDebounce(refresh, 10);

  if (state.loading) {
    return <CircularProgress />;
  }

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
          <TrafficGraph model={model} />
        </>
      )}
    </Content>
  );
}

export default TrafficGraphPage;
