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
import { JenkinsBuild } from '../types';

export interface BuildDeps {
  normalizeJobName(string: string | string[] | undefined): string | undefined;
  request(
    path: string,
    opts?: {
      method?: string;
      query?: Record<string, string | number | undefined>;
      body?: any;
      rawText?: boolean;
      contentType?: string;
    },
  ): Promise<any>;
}

/**
 * Factory for creating a Jenkins Build API interface.
 *
 * Provides helpers for common Jenkins job operations such as:
 * - Fetching build details (`get`)
 * - Fetching build console output as plain text (`getConsoleText`)
 *
 * This function is intended to be used by higher-level clients (e.g., `Jenkins`)
 * and delegates low-level requests to the provided `request` dependency.
 *
 * @param deps - Dependency injection hooks for request handling and job name normalization.
 * @returns An object with methods for interacting with Jenkins builds.
 */
export function createBuildApi(deps: BuildDeps) {
  const { normalizeJobName, request } = deps;

  return {
    /**
     * Retrieves a build's JSON representation from Jenkins.
     *
     * @param name - A build name (string or segments).
     * @param buildNumber - The build number to retrieve.
     * @returns A `JenkinsBuild` object with metadata about the specified build.
     */
    get: async (
      name: string | string[],
      buildNumber: number | string,
    ): Promise<JenkinsBuild> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/${buildNumber}/api/json`);
    },

    /**
     * Retrieves a build's consoleText from Jenkins.
     *
     * @param name - A build name (string or segments).
     * @param buildNumber - The build number to retrieve logs for.
     * @returns The build's console output as plain text.
     */
    getConsoleText: async (
      name: string | string[],
      buildNumber: number | string,
    ): Promise<string> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/${buildNumber}/consoleText`, {
        rawText: true,
      }) as Promise<string>;
    },
  };
}
