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
import _ from 'lodash';
import { IstioConfigDetails } from '../types/IstioConfigDetails';
import { IstioConfigItem } from '../types/IstioConfigList';
import {
  IstioObject,
  ObjectCheck,
  OutlierDetection,
  StatusCondition,
  Validations,
} from '../types/IstioObjects';

export const mergeJsonPatch = (
  objectModified: object,
  object?: object,
): object => {
  if (!object) {
    return objectModified;
  }
  const customizer = (
    objValue: object | null,
    srcValue: object,
  ): object | null => {
    if (!objValue) {
      return null;
    }
    if (_.isObject(objValue) && _.isObject(srcValue)) {
      _.mergeWith(objValue, srcValue, customizer);
    }
    return objValue;
  };
  _.mergeWith(objectModified, object, customizer);
  return objectModified;
};

const k8sHostRegexp =
  /^(\*\.)?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const nsRegexp =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[-a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const hostRegexp =
  /(?=^.{4,253}$)(^((?!-)(([a-zA-Z0-9-]{0,62}[a-zA-Z0-9])|\*)\.)+[a-zA-Z]{2,63}$)/;
const ipRegexp =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
const durationRegexp = /^[\d]{1,10}\.?[\d]{0,10}(h|m|s|ms)$/;

// K8s gateway hosts have only dnsName
export const isK8sGatewayHostValid = (k8sGatewayHost: string): boolean => {
  if (k8sGatewayHost.length < 1 && k8sGatewayHost.length > 253) {
    return false;
  }

  // K8s gateway host must be fqdn but not ip address
  if (
    k8sGatewayHost.split('.').length < 2 ||
    k8sGatewayHost.search(ipRegexp) === 0
  ) {
    return false;
  }

  return k8sGatewayHost.search(k8sHostRegexp) === 0;
};

// Used to check if Sidecar and Gateway host expressions are valid
export const isServerHostValid = (
  serverHost: string,
  nsMandatory: boolean,
): boolean => {
  if (serverHost.length === 0) {
    return false;
  }
  // <namespace>/<host>
  const parts = serverHost.split('/');
  // More than one /
  if (parts.length > 2) {
    return false;
  }
  // Force that namespace/dnsName are present
  if (nsMandatory && parts.length < 2) {
    return false;
  }

  // parts[0] is a dns
  let dnsValid = true;
  let hostValid = true;
  let dns = '';
  let host = '';
  if (parts.length === 2) {
    dns = parts[0];
    host = parts[1];

    if (dns !== '.' && dns !== '*') {
      dnsValid = parts[0].search(nsRegexp) === 0;
    }
  } else {
    host = parts[0];
  }

  if (host !== '*') {
    hostValid = host.search(hostRegexp) === 0;
  }
  return dnsValid && hostValid;
};

export const isValidIp = (ip: string): boolean => {
  return ipRegexp.test(ip);
};

export const isValidUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (__) {
    return false;
  }
  return true;
};

export const isValidDuration = (duration: string): boolean => {
  if (
    duration === '0ms' ||
    duration === '0s' ||
    duration === '0m' ||
    duration === '0h'
  ) {
    return false;
  }
  return durationRegexp.test(duration);
};

export const isValidAbortStatusCode = (statusCode: number): boolean => {
  return statusCode >= 100 && statusCode <= 599;
};

export const isValidOutlierDetection = (
  outlierDetection: OutlierDetection,
): boolean => {
  if (
    outlierDetection.interval &&
    !isValidDuration(outlierDetection.interval)
  ) {
    return false;
  }
  if (
    outlierDetection.baseEjectionTime &&
    !isValidDuration(outlierDetection.baseEjectionTime)
  ) {
    return false;
  }
  return true;
};

export const hasMissingAuthPolicy = (
  workloadName: string,
  validations: Validations | undefined,
): boolean => {
  let hasMissingAP = false;

  if (!validations) {
    return hasMissingAP;
  }

  if (validations.workload && validations.workload[workloadName]) {
    const workloadValidation = validations.workload[workloadName];

    workloadValidation.checks.forEach((check: ObjectCheck) => {
      if (check.code === 'KIA1301') {
        hasMissingAP = true;
      }
    });
  }

  return hasMissingAP;
};

export const getIstioObject = (
  istioObjectDetails?: IstioConfigDetails | IstioConfigItem,
): IstioObject | undefined => {
  let istioObject: IstioObject | undefined;
  if (istioObjectDetails) {
    if (istioObjectDetails.gateway) {
      istioObject = istioObjectDetails.gateway;
    } else if (istioObjectDetails.k8sGateway) {
      istioObject = istioObjectDetails.k8sGateway;
    } else if (istioObjectDetails.k8sGRPCRoute) {
      istioObject = istioObjectDetails.k8sGRPCRoute;
    } else if (istioObjectDetails.k8sHTTPRoute) {
      istioObject = istioObjectDetails.k8sHTTPRoute;
    } else if (istioObjectDetails.k8sReferenceGrant) {
      istioObject = istioObjectDetails.k8sReferenceGrant;
    } else if (istioObjectDetails.k8sTCPRoute) {
      istioObject = istioObjectDetails.k8sTCPRoute;
    } else if (istioObjectDetails.k8sTLSRoute) {
      istioObject = istioObjectDetails.k8sTLSRoute;
    } else if (istioObjectDetails.virtualService) {
      istioObject = istioObjectDetails.virtualService;
    } else if (istioObjectDetails.destinationRule) {
      istioObject = istioObjectDetails.destinationRule;
    } else if (istioObjectDetails.serviceEntry) {
      istioObject = istioObjectDetails.serviceEntry;
    } else if (istioObjectDetails.workloadEntry) {
      istioObject = istioObjectDetails.workloadEntry;
    } else if (istioObjectDetails.workloadGroup) {
      istioObject = istioObjectDetails.workloadGroup;
    } else if (istioObjectDetails.envoyFilter) {
      istioObject = istioObjectDetails.envoyFilter;
    } else if (istioObjectDetails.authorizationPolicy) {
      istioObject = istioObjectDetails.authorizationPolicy;
    } else if (istioObjectDetails.peerAuthentication) {
      istioObject = istioObjectDetails.peerAuthentication;
    } else if (istioObjectDetails.requestAuthentication) {
      istioObject = istioObjectDetails.requestAuthentication;
    } else if (istioObjectDetails.sidecar) {
      istioObject = istioObjectDetails.sidecar;
    } else if (istioObjectDetails.wasmPlugin) {
      istioObject = istioObjectDetails.wasmPlugin;
    } else if (istioObjectDetails.telemetry) {
      istioObject = istioObjectDetails.telemetry;
    }
  }
  return istioObject;
};

export const getReconciliationCondition = (
  istioConfigDetails?: IstioConfigDetails | IstioConfigItem,
): StatusCondition | undefined => {
  const istioObject = getIstioObject(istioConfigDetails);
  return istioObject?.status?.conditions?.find(
    condition => condition.type === 'Reconciled',
  );
};
