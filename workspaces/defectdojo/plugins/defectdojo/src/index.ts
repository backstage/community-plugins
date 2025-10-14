/*
 * Copyright 2025 The Backstage Authors
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
 * Frontend plugin for Backstage that provides UI components to display security findings from DefectDojo.
 *
 * @packageDocumentation
 */

// @public
export { defectdojoApiRef, DefectDojoClient } from './client';

// @public
export type {
  DefectDojoApi,
  DefectDojoVulnerability,
  DefectDojoProduct,
  DefectDojoEngagement,
  PaginatedFindingsResponse,
} from './client';

// @public
export { DefectDojoOverview } from './components/DefectDojoOverview';

// @public
export type { DefectDojoOverviewProps } from './components/DefectDojoOverview';

// @public
export { defectdojoPlugin as default } from './plugin';
