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
import { Entity } from '@backstage/catalog-model';

export const mockSystemEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'System',
  metadata: {
    name: 'examples',
  },
  spec: {
    owner: 'guests',
  },
};

export const mockComponentEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-website',
    annotations: {
      'servicenow.com/entity-id': 'website-for-my-nice-service',
    },
  },
  spec: {
    type: 'website',
    lifecycle: 'experimental',
    owner: 'guests',
    system: 'examples',
    providesApis: ['example-grpc-api'],
  },
};

export const mockApiEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'API',
  metadata: {
    name: 'example-grpc-api',
  },
  spec: {
    type: 'grpc',
    lifecycle: 'experimental',
    owner: 'guests',
    system: 'examples',
    definition: `
syntax = "proto3";

service Exampler {
  rpc Example (ExampleMessage) returns (ExampleMessage) {};
}

message ExampleMessage {
  string example = 1;
};
    `.trim(),
  },
};

export const mockEntities = [
  mockSystemEntity,
  mockComponentEntity,
  mockApiEntity,
];
