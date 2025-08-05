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
    name: 'example-for-report-portal',
    title: 'Example App',
    namespace: 'default',
    annotations: {
      'reportportal.io/host': 'reportportal-drupal-qe.apps.redacted.redhat.com',
      'reportportal.io/project-name': 'customer_portal',
      'reportportal.io/launch-name': 'Customer Portal UI Automation',
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  },
};
