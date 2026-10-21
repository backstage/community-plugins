/*
 * Copyright 2022 The Backstage Authors
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
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { dynatracePlugin, DynatraceTab } from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { dynatraceApiRef } from '../src/api';
import type { DynatraceApi } from '../src/api/DynatraceApi';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-service',
    annotations: {
      'dynatrace.com/dynatrace-entity-id': 'SERVICE-00000000000000',
      'dynatrace.com/synthetics-ids': 'SYNTHETIC_TEST-1234567890ABCDE',
    },
  },
  spec: {
    type: 'service',
  },
};

const mockDynatraceApi: DynatraceApi = {
  async getDynatraceProblems() {
    return {
      totalCount: 1,
      pageSize: 50,
      problems: [
        {
          problemId: 'PROBLEM-12345',
          impactLevel: 'SERVICE',
          status: 'OPEN',
          startTime: Date.now() - 15 * 60 * 1000,
          endTime: -1,
          title: 'Increased failure rate on checkout endpoint',
          severityLevel: 'ERROR',
          rootCauseEntity: {
            entityId: { id: 'SERVICE-00000000000000', type: 'SERVICE' },
            name: 'example-service',
          },
          affectedEntities: [
            {
              entityId: { id: 'SERVICE-00000000000000', type: 'SERVICE' },
              name: 'example-service',
            },
          ],
        },
      ],
    };
  },
  async getDynatraceSyntheticFailures(syntheticsId) {
    return {
      monitorId: syntheticsId,
      locationsExecutionResults: [
        {
          locationId: 10,
          executionId: 'execution-1',
          requestResults: [
            {
              startTimestamp: Date.now() - 35 * 60 * 1000,
            },
          ],
        },
      ],
    };
  },
  async getDynatraceSyntheticLocationInfo() {
    return {
      entityId: 'SYNTHETIC_LOCATION-00000000000000a',
      name: 'US East - Virginia',
      city: 'Ashburn',
      browserType: 'CHROME',
    };
  },
};

createDevApp()
  .registerPlugin(dynatracePlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[dynatraceApiRef, mockDynatraceApi]]}>
        <EntityProvider entity={mockEntity}>
          <DynatraceTab />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/dynatrace',
  })
  .render();
