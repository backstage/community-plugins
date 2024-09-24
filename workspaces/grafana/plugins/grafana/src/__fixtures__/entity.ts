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
  GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR,
  GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD,
  GRAFANA_ANNOTATION_DASHBOARD_SELECTOR,
  GRAFANA_ANNOTATION_TAG_SELECTOR,
} from '../constants';

export const sampleEntity = {
  entity: {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'awesome-service',
      annotations: {
        [GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR]: 'service=awesome-service',
        [GRAFANA_ANNOTATION_TAG_SELECTOR]: 'awesome-tag',
        [GRAFANA_ANNOTATION_DASHBOARD_SELECTOR]:
          "(tags @> 'my-service' || tags @> 'my-service-slo') && tags @> 'generated'",
        [GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD]:
          'https://backstage.io/grafana-dashboard-test',
      },
    },
    spec: {
      lifecycle: 'experimental',
      type: 'service',
      owner: 'cncf',
    },
  },
};
