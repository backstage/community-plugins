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
import { KIALI_WIZARD_LABEL } from '../components/IstioWizards/WizardActions';
import {
  DEGRADED,
  FAILURE,
  HEALTHY,
  NA,
  ServiceHealth,
  Status,
} from './Health';
import {
  DestinationRule,
  getWizardUpdateLabel,
  K8sGRPCRoute,
  K8sHTTPRoute,
  ObjectCheck,
  ObjectValidation,
  ServiceEntry,
  Validations,
  ValidationTypes,
  VirtualService,
} from './IstioObjects';
import { ResourcePermissions } from './Permissions';
import { ServiceOverview } from './ServiceList';
import { TLSStatus } from './TLSStatus';
import { AdditionalItem, WorkloadInfo } from './Workload';

export interface ServicePort {
  name: string;
  port: number;
  protocol: string;
  appProtocol?: string;
  istioProtocol: string;
  tlsMode: string;
}

export interface Endpoints {
  addresses?: EndpointAddress[];
  ports?: ServicePort[];
}

interface EndpointAddress {
  ip: string;
  kind?: string;
  name?: string;
  istioProtocol?: string;
  tlsMode?: string;
}

export interface WorkloadOverview {
  name: string;
  type: string;
  istioSidecar: boolean;
  istioAmbient: boolean;
  labels?: { [key: string]: string };
  resourceVersion: string;
  createdAt: string;
  serviceAccountNames: string[];
}

export interface Service {
  additionalDetails: AdditionalItem[];
  type: string;
  name: string;
  createdAt: string;
  resourceVersion: string;
  ip: string;
  ports?: ServicePort[];
  annotations: { [key: string]: string };
  externalName: string;
  labels?: { [key: string]: string };
  selectors?: { [key: string]: string };
  cluster?: string;
}

export interface ServiceDetailsInfo {
  destinationRules: DestinationRule[];
  endpoints?: Endpoints[];
  health?: ServiceHealth;
  isAmbient: boolean;
  istioPermissions: ResourcePermissions;
  istioSidecar: boolean;
  k8sGRPCRoutes: K8sGRPCRoute[];
  k8sHTTPRoutes: K8sHTTPRoute[];
  namespaceMTLS?: TLSStatus;
  service: Service;
  serviceEntries: ServiceEntry[];
  subServices?: ServiceOverview[];
  validations: Validations;
  virtualServices: VirtualService[];
  waypointWorkloads?: WorkloadInfo[];
  workloads?: WorkloadOverview[];
}

export interface ServiceDetailsQuery {
  rateInterval?: string;
  validate?: boolean;
}

export function getServiceDetailsUpdateLabel(
  serviceDetails: ServiceDetailsInfo | null,
) {
  return getWizardUpdateLabel(
    serviceDetails?.virtualServices || null,
    serviceDetails?.k8sHTTPRoutes || null,
  );
}

export function hasServiceDetailsTrafficRouting(
  serviceDetails: ServiceDetailsInfo | null,
): boolean;
export function hasServiceDetailsTrafficRouting(
  vsList: VirtualService[],
  drList: DestinationRule[],
  routeList?: K8sHTTPRoute[],
): boolean;
export function hasServiceDetailsTrafficRouting(
  serviceDetailsOrVsList: ServiceDetailsInfo | VirtualService[] | null,
  drList?: DestinationRule[],
  routeList?: K8sHTTPRoute[],
): boolean {
  let virtualServicesList: VirtualService[];
  let destinationRulesList: DestinationRule[];
  let httpRoutesList: K8sHTTPRoute[];

  if (serviceDetailsOrVsList === null) {
    return false;
  }

  if ('length' in serviceDetailsOrVsList) {
    virtualServicesList = serviceDetailsOrVsList;
    destinationRulesList = drList || [];
    httpRoutesList = routeList || [];
  } else {
    virtualServicesList = serviceDetailsOrVsList.virtualServices;
    destinationRulesList = serviceDetailsOrVsList.destinationRules;
    httpRoutesList = serviceDetailsOrVsList.k8sHTTPRoutes;
  }

  return (
    virtualServicesList.length > 0 ||
    destinationRulesList.length > 0 ||
    httpRoutesList.length > 0
  );
}

const higherThan = [
  'error-warning',
  'error-improvement',
  'error-correct',
  'warning-improvement',
  'warning-correct',
  'improvement-correct',
];

export const higherSeverity = (
  a: ValidationTypes,
  b: ValidationTypes,
): boolean => {
  return higherThan.includes(`${a}-${b}`);
};

export const highestSeverity = (checks: ObjectCheck[]): ValidationTypes => {
  let severity: ValidationTypes = ValidationTypes.Correct;

  checks.forEach(check => {
    if (higherSeverity(check.severity, severity)) {
      severity = check.severity;
    }
  });

  return severity;
};

export const validationToHealth = (severity: ValidationTypes): Status => {
  let status: Status = NA;
  if (severity === ValidationTypes.Correct) {
    status = HEALTHY;
  } else if (severity === ValidationTypes.Warning) {
    status = DEGRADED;
  } else if (severity === ValidationTypes.Error) {
    status = FAILURE;
  }
  return status;
};

const numberOfChecks = (type: ValidationTypes, object: ObjectValidation) =>
  (object && object.checks ? object.checks : []).filter(
    i => i.severity === type,
  ).length;

export const validationToSeverity = (
  object: ObjectValidation,
): ValidationTypes => {
  const warnChecks = numberOfChecks(ValidationTypes.Warning, object);
  const errChecks = numberOfChecks(ValidationTypes.Error, object);
  if (errChecks > 0) {
    return ValidationTypes.Error;
  } else if (warnChecks > 0) {
    return ValidationTypes.Warning;
  }
  return ValidationTypes.Correct;
};

export const checkForPath = (
  object: ObjectValidation | undefined,
  path: string,
): ObjectCheck[] => {
  if (!object || !object.checks) {
    return [];
  }

  return object.checks.filter(item => {
    return item.path === path;
  });
};

export const globalChecks = (object: ObjectValidation): ObjectCheck[] => {
  return checkForPath(object, '');
};

export function getServiceWizardLabel(serviceDetails: Service): string {
  if (
    serviceDetails &&
    serviceDetails.labels &&
    serviceDetails.labels[KIALI_WIZARD_LABEL]
  ) {
    return serviceDetails.labels[KIALI_WIZARD_LABEL];
  }
  return '';
}

export function getServicePort(ports: { [key: string]: number }): number {
  let port = 80;
  if (ports) {
    port = Object.values(ports)[0];
  }
  return port;
}
