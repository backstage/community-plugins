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
 * Re-exports Topology UI fixtures for the e2e/dev kubernetes backend.
 * CI has no live cluster; these payloads are the justified remaining mock.
 *
 * Single source of truth with the FE mock: both use
 * `plugins/topology/src/__fixtures__/1-deployments`. FE-only helpers under
 * `dev/` (e.g. url-security-fixtures) stay out of the backend so the two
 * harnesses do not drift — `yarn start:mock` can still layer them in
 * `dev/mocks.ts`.
 *
 * Relative monorepo import: fixtures are not part of the published
 * `@backstage-community/plugin-topology` export map.
 */
/* eslint-disable @backstage/no-relative-monorepo-imports */
export { mockKubernetesResponse } from '../../../topology/src/__fixtures__/1-deployments';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export const FIXTURE_CLUSTER_NAME = 'mock-cluster';
