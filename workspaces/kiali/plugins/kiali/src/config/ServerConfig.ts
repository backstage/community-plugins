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
  MeshCluster,
  ServerConfig,
} from '@backstage-community/plugin-kiali-common/types';
import _ from 'lodash';
import { parseHealthConfig } from './HealthConfig';

export type Durations = { [key: number]: string };

export type ComputedServerConfig = ServerConfig & {
  durations: Durations;
};

function getHomeCluster(cfg: ServerConfig): MeshCluster | undefined {
  return Object.values(cfg.clusters).find(cluster => cluster.isKialiHome);
}

export const humanDurations = (
  cfg: ComputedServerConfig,
  prefix?: string,
  suffix?: string,
) =>
  _.mapValues(cfg.durations, v =>
    _.reject([prefix, v, suffix], _.isEmpty).join(' '),
  );

const toDurations = (tupleArray: [number, string][]): Durations => {
  const obj: { [index: string]: any } = {};
  tupleArray.forEach(tuple => {
    obj[tuple[0]] = tuple[1];
  });
  return obj;
};

const durationsTuples: [number, string][] = [
  [60, '1m'],
  [120, '2m'],
  [300, '5m'],
  [600, '10m'],
  [1800, '30m'],
  [3600, '1h'],
  [10800, '3h'],
  [21600, '6h'],
  [43200, '12h'],
  [86400, '1d'],
  [604800, '7d'],
  [2592000, '30d'],
];

const computeValidDurations = (cfg: ComputedServerConfig) => {
  const tsdbRetention = cfg.prometheus.storageTsdbRetention;
  const scrapeInterval = cfg.prometheus.globalScrapeInterval;
  let filtered = durationsTuples.filter(
    d =>
      (!tsdbRetention || d[0] <= tsdbRetention!) &&
      (!scrapeInterval || d[0] >= scrapeInterval * 2),
  );
  // Make sure we keep at least one item, even if it's silly
  if (filtered.length === 0) {
    filtered = [durationsTuples[0]];
  }
  cfg.durations = toDurations(filtered);
};

// Set some reasonable defaults. Initial values should be valid for fields
// than may not be providedby/set on the server.
export const defaultServerConfig: ComputedServerConfig = {
  accessibleNamespaces: [],
  ambientEnabled: false,
  authStrategy: '',
  clusters: {},
  durations: {},
  gatewayAPIEnabled: false,
  logLevel: '',
  healthConfig: {
    rate: [],
  },
  deployment: {
    viewOnlyMode: false,
  },
  installationTag: 'Kiali Console',
  istioAnnotations: {
    ambientAnnotation: 'ambient.istio.io/redirection',
    ambientAnnotationEnabled: 'enabled',
    istioInjectionAnnotation: 'sidecar.istio.io/inject',
  },
  istioCanaryRevision: {
    current: '',
    upgrade: '',
  },
  istioIdentityDomain: 'svc.cluster.local',
  istioNamespace: 'istio-system',
  istioLabels: {
    ambientWaypointLabel: 'gateway.istio.io/managed',
    ambientWaypointLabelValue: 'istio.io-mesh-controller',
    appLabelName: 'app',
    injectionLabelName: 'istio-injection',
    injectionLabelRev: 'istio.io/rev',
    versionLabelName: 'version',
  },
  kialiFeatureFlags: {
    certificatesInformationIndicators: {
      enabled: true,
    },
    disabledFeatures: [],
    istioInjectionAction: true,
    istioAnnotationAction: true,
    istioUpgradeAction: false,
    uiDefaults: {
      graph: {
        findOptions: [],
        hideOptions: [],
        impl: 'cy',
        settings: {
          fontLabel: 13,
          minFontBadge: 7,
          minFontLabel: 10,
        },
        traffic: {
          grpc: 'requests',
          http: 'requests',
          tcp: 'sent',
        },
      },
      list: {
        includeHealth: true,
        includeIstioResources: true,
        includeValidations: true,
        showIncludeToggles: false,
      },
    },
  },
  prometheus: {
    globalScrapeInterval: 15,
    storageTsdbRetention: 21600,
  },
};

// Overwritten with real server config on user login. Also used for tests.
let serverConfig = defaultServerConfig;
computeValidDurations(serverConfig);
export { serverConfig };

let homeCluster = getHomeCluster(serverConfig);
const isMultiCluster = isMC();
export { homeCluster, isMultiCluster };

export const getServerConfig = (): ComputedServerConfig => {
  return serverConfig;
};

export const toValidDuration = (duration: number): number => {
  const currentServerConfig = getServerConfig();
  // Check if valid
  if (currentServerConfig.durations[duration]) {
    return duration;
  }
  // Get closest duration
  const validDurations = durationsTuples.filter(
    d => currentServerConfig.durations[d[0]],
  );
  for (let i = validDurations.length - 1; i > 0; i--) {
    if (duration > durationsTuples[i][0]) {
      return validDurations[i][0];
    }
  }
  return validDurations[0][0];
};

export const setServerConfig = (cfg: ServerConfig) => {
  serverConfig = {
    ...defaultServerConfig,
    ...cfg,
  };

  serverConfig.healthConfig = cfg.healthConfig
    ? parseHealthConfig(cfg.healthConfig)
    : serverConfig.healthConfig;
  computeValidDurations(serverConfig);

  homeCluster = getHomeCluster(serverConfig);
};

export const isIstioNamespace = (namespace: string): boolean => {
  const currentServerConfig = getServerConfig();
  if (currentServerConfig && namespace === currentServerConfig.istioNamespace) {
    return true;
  }
  return false;
};
export const isHomeCluster = (cluster: string): boolean => {
  return !isMultiCluster || cluster === homeCluster?.name;
};

// Return true if the cluster is configured for this Kiali instance
export const isConfiguredCluster = (cluster: string): boolean => {
  return Object.keys(serverConfig.clusters).includes(cluster);
};

function isMC(): boolean {
  return Object.keys(serverConfig.clusters).length > 1;
}
