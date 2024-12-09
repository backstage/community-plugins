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

/**
 * Visibility level for a SonarCloud project.
 * @public
 */
export type ProjectVisibility = 'public' | 'private';

/**
 * Strategy for defining the new code period boundary.
 * @public
 */
export type NewCodeDefinitionType =
  | 'previous_version'
  | 'number_of_days'
  | 'reference_branch';

/**
 * Discriminated union of new code definition parameters per strategy type.
 * @public
 */
export type NewCodeDefinitionParams =
  | { type: 'previous_version'; projectKey: string }
  | { type: 'number_of_days'; projectKey: string; value: string }
  | { type: 'reference_branch'; projectKey: string; value: string };

/**
 * Parameters for creating a new SonarCloud project.
 * @public
 */
export interface CreateProjectParams {
  /** SonarCloud organization key that owns the project. */
  organization: string;
  /** Human-readable display name for the project. */
  name: string;
  /** Unique project key within the organization. */
  key: string;
  /** Project visibility; defaults to the organization's setting when omitted. */
  visibility?: ProjectVisibility;
}

/**
 * Result returned after successfully creating a SonarCloud project.
 * @public
 */
export interface CreateProjectResult {
  /** The unique key assigned to the created project. */
  projectKey: string;
  /** Internal UUID needed for v2 API calls (e.g., bind-project). */
  projectId: string;
  /** Direct URL to the project overview in SonarCloud. */
  projectUrl: string;
}

/**
 * Parameters for binding a SonarCloud project to a repository.
 * Uses v2 API at api.sonarcloud.io/dop-translation/project-bindings.
 * @public
 */
export interface BindProjectParams {
  /** Internal project UUID from create-project result. */
  projectId: string;
  /** Repository identifier as "owner/repo" (e.g., "Cibahealth/my-service"). */
  repositoryId: string;
}

/**
 * A quality gate definition from SonarCloud.
 * @public
 */
export interface QualityGate {
  /** Numeric identifier of the quality gate. */
  id: number;
  /** Human-readable name of the quality gate. */
  name: string;
}

/**
 * Shape of the GET /api/qualitygates/list response from SonarCloud.
 * @public
 */
export interface QualityGateListResponse {
  /** Array of quality gate entries returned by the API. */
  qualitygates: Array<{
    /** Numeric identifier. */
    id: number;
    /** Display name. */
    name: string;
    /** Whether this gate is the organization default. */
    isDefault?: boolean;
    /** Whether this gate is a built-in (non-editable) gate. */
    isBuiltIn?: boolean;
  }>;
}

/**
 * Default values read from app-config (`sonarcloud.*`).
 * Actions use these unless overridden by input.
 * @public
 */
export interface SonarCloudDefaults {
  /** Default API token from `sonarcloud.token`. */
  token?: string;
  /** Default organization from `sonarcloud.organization`. */
  organization?: string;
}
