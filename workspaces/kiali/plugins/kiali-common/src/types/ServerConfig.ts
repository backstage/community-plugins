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
import { DurationInSeconds } from './Common';
import { MeshCluster } from './Mesh';

export type Durations = { [key: number]: string };

export type IstioLabelKey =
  | 'ambientWaypointLabel'
  | 'ambientWaypointLabelValue'
  | 'appLabelName'
  | 'versionLabelName'
  | 'injectionLabelName'
  | 'injectionLabelRev';

interface DeploymentConfig {
  viewOnlyMode: boolean;
}

interface IstioAnnotations {
  ambientAnnotation: string;
  ambientAnnotationEnabled: string;
  // this could also be the name of the pod label, both label and annotation are supported
  istioInjectionAnnotation: string;
}

interface GraphFindOption {
  autoSelect: boolean;
  description: string;
  expression: string;
}

interface GraphTraffic {
  grpc: string;
  http: string;
  tcp: string;
}

interface GraphSettings {
  fontLabel: number;
  minFontBadge: number;
  minFontLabel: number;
}

interface GraphUIDefaults {
  findOptions: GraphFindOption[];
  hideOptions: GraphFindOption[];
  impl: 'both' | 'cy' | 'pf';
  settings: GraphSettings;
  traffic: GraphTraffic;
}

interface ListUIDefaults {
  includeHealth: boolean;
  includeIstioResources: boolean;
  includeValidations: boolean;
  showIncludeToggles: boolean;
}

interface UIDefaults {
  graph: GraphUIDefaults;
  list: ListUIDefaults;
  metricsPerRefresh?: string;
  namespaces?: string[];
  refreshInterval?: string;
}

interface CertificatesInformationIndicators {
  enabled: boolean;
}

interface KialiFeatureFlags {
  certificatesInformationIndicators: CertificatesInformationIndicators;
  disabledFeatures: string[];
  istioInjectionAction: boolean;
  istioAnnotationAction: boolean;
  istioUpgradeAction: boolean;
  uiDefaults: UIDefaults;
}

// Not based exactly on Kiali configuration but rather whether things like prometheus config
// allow for certain Kiali features. True means the feature is crippled, false means supported.
export interface KialiCrippledFeatures {
  requestSize: boolean;
  requestSizeAverage: boolean;
  requestSizePercentiles: boolean;
  responseSize: boolean;
  responseSizeAverage: boolean;
  responseSizePercentiles: boolean;
  responseTime: boolean;
  responseTimeAverage: boolean;
  responseTimePercentiles: boolean;
}

interface IstioCanaryRevision {
  current: string;
  upgrade: string;
}

/*
 Health Config
*/
export type RegexConfig = string | RegExp;

export interface HealthConfig {
  rate: RateHealthConfig[];
}

// rateHealthConfig
export interface RateHealthConfig {
  namespace?: RegexConfig;
  kind?: RegexConfig;
  name?: RegexConfig;
  tolerance: ToleranceConfig[];
}
// toleranceConfig
export interface ToleranceConfig {
  code: RegexConfig;
  degraded: number;
  failure: number;
  protocol?: RegexConfig;
  direction?: RegexConfig;
}

/*
 End Health Config
*/

export interface ServerConfig {
  accessibleNamespaces: Array<string>;
  ambientEnabled: boolean;
  authStrategy: string;
  clusters: { [key: string]: MeshCluster };
  deployment: DeploymentConfig;
  gatewayAPIEnabled: boolean;
  healthConfig: HealthConfig;
  installationTag?: string;
  istioAnnotations: IstioAnnotations;
  istioCanaryRevision: IstioCanaryRevision;
  istioIdentityDomain: string;
  istioNamespace: string;
  istioLabels: { [key in IstioLabelKey]: string };
  kialiFeatureFlags: KialiFeatureFlags;
  logLevel: string;
  prometheus: {
    globalScrapeInterval?: DurationInSeconds;
    storageTsdbRetention?: DurationInSeconds;
  };
}

export type ComputedServerConfig = ServerConfig & {
  durations: Durations;
};
