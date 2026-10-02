/*
 * Copyright 2026 The Backstage Authors
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
import { fetchApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { openCostPlugin, OpenCostPage } from '../src/plugin';

// ---------------------------------------------------------------------------
// Mock allocation data – represents a 3-day window aggregated by namespace
// ---------------------------------------------------------------------------

function makeAllocationSet(startIso: string, endIso: string) {
  return {
    default: {
      name: 'default',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCoreRequestAverage: 0.25,
      cpuCoreUsageAverage: 0.18,
      cpuCoreHours: 6.0,
      cpuCost: 0.12,
      cpuEfficiency: 0.72,
      gpuCost: 0.0,
      networkCost: 0.002,
      pvCost: 0.015,
      ramByteRequestAverage: 536870912,
      ramByteUsageAverage: 402653184,
      ramByteHours: 12884901888,
      ramCost: 0.06,
      ramEfficiency: 0.75,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.197,
      totalEfficiency: 0.73,
    },
    'kube-system': {
      name: 'kube-system',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCoreRequestAverage: 0.15,
      cpuCoreUsageAverage: 0.12,
      cpuCoreHours: 3.6,
      cpuCost: 0.07,
      cpuEfficiency: 0.8,
      gpuCost: 0.0,
      networkCost: 0.001,
      pvCost: 0.0,
      ramByteRequestAverage: 268435456,
      ramByteUsageAverage: 201326592,
      ramByteHours: 6442450944,
      ramCost: 0.03,
      ramEfficiency: 0.75,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.101,
      totalEfficiency: 0.78,
    },
    monitoring: {
      name: 'monitoring',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCoreRequestAverage: 0.5,
      cpuCoreUsageAverage: 0.35,
      cpuCoreHours: 12.0,
      cpuCost: 0.24,
      cpuEfficiency: 0.7,
      gpuCost: 0.0,
      networkCost: 0.005,
      pvCost: 0.08,
      ramByteRequestAverage: 1073741824,
      ramByteUsageAverage: 858993459,
      ramByteHours: 25769803776,
      ramCost: 0.12,
      ramEfficiency: 0.8,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.445,
      totalEfficiency: 0.74,
    },
    'cert-manager': {
      name: 'cert-manager',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCoreRequestAverage: 0.05,
      cpuCoreUsageAverage: 0.03,
      cpuCoreHours: 1.2,
      cpuCost: 0.024,
      cpuEfficiency: 0.6,
      gpuCost: 0.0,
      networkCost: 0.0,
      pvCost: 0.0,
      ramByteRequestAverage: 67108864,
      ramByteUsageAverage: 50331648,
      ramByteHours: 1610612736,
      ramCost: 0.008,
      ramEfficiency: 0.75,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.032,
      totalEfficiency: 0.67,
    },
    'ingress-nginx': {
      name: 'ingress-nginx',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCoreRequestAverage: 0.1,
      cpuCoreUsageAverage: 0.08,
      cpuCoreHours: 2.4,
      cpuCost: 0.048,
      cpuEfficiency: 0.8,
      gpuCost: 0.0,
      networkCost: 0.02,
      pvCost: 0.0,
      ramByteRequestAverage: 134217728,
      ramByteUsageAverage: 100663296,
      ramByteHours: 3221225472,
      ramCost: 0.016,
      ramEfficiency: 0.75,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.084,
      totalEfficiency: 0.78,
    },
    '__idle__/cluster-one': {
      name: '__idle__/cluster-one',
      start: startIso,
      end: endIso,
      minutes: 1440,
      cpuCost: 0.15,
      gpuCost: 0.0,
      networkCost: 0.0,
      pvCost: 0.0,
      ramCost: 0.05,
      sharedCost: 0.0,
      externalCost: 0.0,
      totalCost: 0.2,
      totalEfficiency: 0.0,
    },
  };
}

const mockAllocationResponse = {
  status: 'success',
  data: [
    makeAllocationSet('2026-09-18T00:00:00Z', '2026-09-19T00:00:00Z'),
    makeAllocationSet('2026-09-19T00:00:00Z', '2026-09-20T00:00:00Z'),
    makeAllocationSet('2026-09-20T00:00:00Z', '2026-09-21T00:00:00Z'),
  ],
};

// ---------------------------------------------------------------------------
// Mock FetchApi – intercepts calls to the OpenCost allocation endpoint
// ---------------------------------------------------------------------------

const mockFetchApi = {
  fetch: async (input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/allocation/compute')) {
      return new Response(JSON.stringify(mockAllocationResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Fall through to real fetch for anything else
    return fetch(input);
  },
};

// ---------------------------------------------------------------------------
// Dev app
// ---------------------------------------------------------------------------

createDevApp()
  .registerPlugin(openCostPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[fetchApiRef, mockFetchApi]]}>
        <OpenCostPage />
      </TestApiProvider>
    ),
    title: 'OpenCost',
    path: '/opencost',
  })
  .render();
