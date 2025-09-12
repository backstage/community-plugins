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

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage-multi-ci',
    description: 'A plugin to view multiple CI sources in a single view',
    annotations: {
      'jenkins.io/job-full-name': 'calculator-app-pipeline',
      'github.com/project-slug': 'test-project',
      'gitlab.com/project-id': '112757',
      'mssv/enabled': 'true',
      'dev.azure.com/project': 'some-project',
      'dev.azure.com/build-definition': 'some-build',
      'dev.azure.com/host-org': 'dev.azure.com/test-project',
    },
  },
  spec: {
    type: 'service',
    owner: 'user:guest',
    lifecycle: 'development',
  },
};
