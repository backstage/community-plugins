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
 * Re-exports Tekton UI fixtures for the e2e/dev kubernetes backend.
 * CI has no live cluster; these payloads are the justified remaining mock.
 *
 * Relative monorepo import: fixtures are not part of the published
 * `@backstage-community/plugin-tekton` export map.
 */
/* eslint-disable @backstage/no-relative-monorepo-imports */
export { mockKubernetesPlrResponse } from '../../../tekton/src/__fixtures__/1-pipelinesData';
export {
  acsDeploymentCheck,
  acsImageCheckResults,
  acsImageScanResult,
} from '../../../tekton/src/__fixtures__/advancedClusterSecurityData';
export { enterpriseContractResult } from '../../../tekton/src/__fixtures__/enterpriseContractData';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export const FIXTURE_CLUSTER_NAME = 'mock-cluster';
