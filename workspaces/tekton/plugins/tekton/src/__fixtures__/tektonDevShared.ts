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

/**
 * Shared Tekton dev/e2e fixture helpers used by both:
 * - FE-only mocks (`plugins/tekton/dev/mocks.ts`) for `yarn start:mock`
 * - fixture-backed kubernetes-backend (`tekton-dev-backend` fixtures) for full-stack e2e
 *
 * Payload JSON stays in the sibling `__fixtures__` files; this module holds the
 * cluster name + resource/log mapping so those two paths stay in sync.
 */

import {
  acsDeploymentCheck,
  acsImageCheckResults,
  acsImageScanResult,
} from './advancedClusterSecurityData';
import { enterpriseContractResult } from './enterpriseContractData';

export const FIXTURE_CLUSTER_NAME = 'mock-cluster';

export type TektonFixtureResourceGroup = {
  type: string;
  resources: unknown[];
};

/**
 * Maps `mockKubernetesPlrResponse` keys to kubernetes-backend / MockKubernetesClient
 * resource groups (PipelineRun/TaskRun → customresources).
 */
export function buildTektonFixtureResources(fixtureData: {
  [resourceType: string]: unknown[];
}): TektonFixtureResourceGroup[] {
  return Object.entries(fixtureData).flatMap(([type, resources]) => {
    const firstKind = (resources[0] as { kind?: string } | undefined)?.kind;
    if (type === 'pipelineruns' && firstKind === 'PipelineRun') {
      return {
        type: 'customresources',
        resources,
      };
    }
    if (type === 'taskruns' && firstKind === 'TaskRun') {
      return {
        type: 'customresources',
        resources,
      };
    }
    return {
      type: type.toLocaleLowerCase('en-US'),
      resources,
    };
  });
}

/**
 * Same ACS/EC/log payloads as the FE mock KubernetesProxyApi, keyed by pod name.
 */
export function getTektonFixturePodLogText(
  podName: string,
  containerName = 'step',
): string {
  if (podName.includes('ec-task')) {
    return JSON.stringify(enterpriseContractResult);
  }
  if (podName.includes('image-scan-task')) {
    return JSON.stringify(acsImageScanResult);
  }
  if (podName.includes('image-check-task')) {
    return JSON.stringify(acsImageCheckResults);
  }
  if (podName.includes('deployment-check-task')) {
    return JSON.stringify(acsDeploymentCheck);
  }
  return `\nstreaming logs from container: ${containerName} \n...`;
}
