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

import { AceOptions } from 'react-ace/types';
import {
  AuthorizationPolicy,
  DestinationRule,
  EnvoyFilter,
  Gateway,
  HelpMessage,
  IstioObject,
  K8sGateway,
  K8sGRPCRoute,
  K8sHTTPRoute,
  K8sReferenceGrant,
  K8sTCPRoute,
  K8sTLSRoute,
  ObjectValidation,
  PeerAuthentication,
  References,
  RequestAuthentication,
  ServiceEntry,
  Sidecar,
  Telemetry,
  VirtualService,
  WasmPlugin,
  WorkloadEntry,
  WorkloadGroup,
} from './IstioObjects';
import { Namespace } from './Namespace';
import { ResourcePermissions } from './Permissions';

export interface IstioConfigId {
  namespace: string;
  objectType: string;
  object: string;
}

export interface IstioConfigDetails {
  authorizationPolicy: AuthorizationPolicy;
  cluster?: string;
  destinationRule: DestinationRule;
  envoyFilter: EnvoyFilter;
  gateway: Gateway;
  help?: HelpMessage[];
  k8sGRPCRoute: K8sGRPCRoute;
  k8sGateway: K8sGateway;
  k8sHTTPRoute: K8sHTTPRoute;
  k8sReferenceGrant: K8sReferenceGrant;
  k8sTCPRoute: K8sTCPRoute;
  k8sTLSRoute: K8sTLSRoute;
  namespace: Namespace;
  peerAuthentication: PeerAuthentication;
  permissions: ResourcePermissions;
  references?: References;
  requestAuthentication: RequestAuthentication;
  serviceEntry: ServiceEntry;
  sidecar: Sidecar;
  telemetry: Telemetry;
  validation: ObjectValidation;
  virtualService: VirtualService;
  wasmPlugin: WasmPlugin;
  workloadEntry: WorkloadEntry;
  workloadGroup: WorkloadGroup;
}

export const aceOptions: AceOptions = {
  showPrintMargin: false,
  autoScrollEditorIntoView: true,
};

export const safeDumpOptions = {
  styles: {
    '!!null': 'canonical', // dump null as ~
  },
};

export interface ParsedSearch {
  type?: string;
  name?: string;
}

export interface IstioPermissions {
  [namespace: string]: {
    [type: string]: ResourcePermissions;
  };
}

// Helper function to compare two IstioConfigDetails iterating over its IstioObject children.
// When an IstioObject child has changed (resourceVersion is different) it will return a tuple with
//  boolean: true if resourceVersion has changed in newer version
//  string: IstioObject child
//  string: resourceVersion of newer version
export const compareResourceVersion = (
  oldIstioConfigDetails: IstioConfigDetails,
  newIstioConfigDetails: IstioConfigDetails,
): [boolean, string, string] => {
  const keys = Object.keys(oldIstioConfigDetails);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const oldIstioObject = oldIstioConfigDetails[
      key as keyof IstioConfigDetails
    ] as IstioObject;
    const newIstioObject = newIstioConfigDetails[
      key as keyof IstioConfigDetails
    ] as IstioObject;
    if (
      oldIstioObject &&
      newIstioObject &&
      oldIstioObject.metadata &&
      newIstioObject.metadata &&
      oldIstioObject.metadata.resourceVersion &&
      newIstioObject.metadata.resourceVersion &&
      oldIstioObject.metadata.resourceVersion !==
        newIstioObject.metadata.resourceVersion
    ) {
      return [true, key, newIstioObject.metadata.resourceVersion];
    }
  }
  return [false, '', ''];
};

export interface IstioConfigDetailsQuery {
  help?: boolean;
  validate?: boolean;
}
