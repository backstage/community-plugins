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

import type { JenkinsParams, JobBuildOptions, JobGetOptions } from './types';

export interface JobDeps {
  normalizeJobName(name: string | string[] | undefined): string | undefined;
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
 * Factory for creating a Jenkins Job API interface.
 *
 * Provides helpers for common Jenkins job operations such as:
 * - Fetching job details (`get`)
 * - Triggering builds (`build`)
 * - Copying or creating jobs (`copy`, `create`)
 * - Managing job state (`enable`, `disable`, `destroy`)
 *
 * This function is intended to be used by higher-level clients (e.g., `Jenkins`)
 * and delegates low-level requests to the provided `request` dependency.
 *
 * @param deps - Dependency injection hooks for request handling and job name normalization.
 * @returns An object with methods for interacting with Jenkins jobs.
 */
export function createJobApi(deps: JobDeps) {
  const { normalizeJobName, request } = deps;

  // Helper utils

  /**
   * Takes in a {@link JenkinsParams} object and returns a {@link URLSearchParams} object.
   *   - If the object passed is `undefined`, an empty {@link URLSearchParams} is returned.
   *   - If the object passed is already a {@link URLSearchParams} it gets returned as is.
   *
   * @param params a {@link JenkinsParams} object.
   * @returns a {@link URLSearchParams} object
   */
  const paramsToSearchParams = (params?: JenkinsParams): URLSearchParams => {
    if (!params) {
      return new URLSearchParams();
    }
    if (params instanceof URLSearchParams) {
      return params;
    }

    const result = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) {
        continue;
      }
      result.set(k, String(v));
    }
    return result;
  };

  /**
   * Extracts the last path segment (the "leaf" job name) from a Jenkins job name.
   *
   * @param name - The job name, either as a slash-delimited string (e.g. "folder/job")
   *               or as an array of segments (e.g. ["folder", "job"]).
   * @returns The last segment of the job name, or an empty string if none exists.
   *
   * @example
   * leafSegment("folder/job"); // "job"
   * leafSegment(["folder", "job"]); // "job"
   * leafSegment("root"); // "root"
   */
  const leafSegment = (name: string | string[]): string => {
    if (Array.isArray(name)) {
      return name[name.length - 1];
    }
    const parts = name.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  };

  /**
   * Returns all parent path segments of a Jenkins job name, excluding the leaf.
   *
   * @param name - The job name, either as a slash-delimited string (e.g. "a/b/c")
   *               or as an array of segments (e.g. ["a", "b", "c"]).
   * @returns An array of all parent segments, or an empty array if the job is at the root.
   *
   * @example
   * parentSegments("a/b/c"); // ["a", "b"]
   * parentSegments(["a", "b", "c"]); // ["a", "b"]
   * parentSegments("job"); // []
   */
  const parentSegments = (name: string | string[] | undefined): string[] => {
    if (!name) {
      return [];
    }

    // Return everything but leaf
    if (Array.isArray(name)) {
      return name.slice(0, -1);
    }

    const parts = name.split('/').filter(Boolean);
    if (parts.length > 1) {
      return parts.slice(0, -1);
    }

    return [];
  };

  const getJobGetOptions = (
    input: JobGetOptions | string | string[],
  ): JobGetOptions => {
    // Just name
    if (typeof input === 'string' || Array.isArray(input)) {
      return { name: input };
    }
    // name + other option(s).
    return input;
  };

  return {
    /**
     * Retrieves a job’s JSON representation from Jenkins.
     *
     * @param input - A job name (string or segments) or a {@link JobGetOptions} object.
     *                When an options object is provided, `tree` and `depth` are forwarded
     *                to `/api/json` as query params.
     * @returns The parsed job JSON.
     */
    get: async (input: JobGetOptions | string | string[]) => {
      const { name, tree, depth } = getJobGetOptions(input);
      const jobPath = normalizeJobName(name);
      const query: Record<string, string | number> = {};
      if (tree) {
        query.tree = tree;
      }
      if (typeof depth === 'number') {
        query.depth = depth;
      }
      return request(`${jobPath}/api/json`, { query });
    },

    /**
     * Retrieves only the builds portion of a job (server-side filtered via `tree`).
     *
     * @param name - The job name (string or array).
     * @param tree - The Jenkins Remote API `tree` expression selecting build fields.
     *               Defaults to `builds[number,url,result,timestamp,id,queueId,displayName,duration]`
     * @returns A JSON object containing the requested build fields.
     */
    getBuilds: async (
      name: string | string[],
      tree = 'builds[number,url,result,timestamp,id,queueId,displayName,duration]',
    ): Promise<unknown> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/api/json`, {
        query: { tree },
      });
    },

    /**
     * Triggers a Jenkins job build.
     *
     * Uses `/build` or `/buildWithParameters` depending on whether parameters are provided.
     * Automatically URL-encodes parameters and supports legacy options like `delay` and `token`.
     *
     * @param name - The job name (string or array form).
     * @param opts - Optional build options (parameters, token, delay).
     * @returns A promise that resolves when the build request is accepted.
     */
    build: async (
      name: string | string[],
      opts?: JobBuildOptions,
    ): Promise<unknown> => {
      const { parameters, token, delay } = opts ?? {};

      const jobPath = normalizeJobName(name);

      // Check if we have search params
      // This will determine the endpoint used
      const hasParams =
        parameters instanceof URLSearchParams
          ? Array.from(parameters.keys()).length > 0
          : parameters &&
            Object.keys(parameters as Record<string, unknown>).length > 0;

      const endpoint = hasParams ? 'buildWithParameters' : 'build';

      const query: Record<string, string> = {};
      if (token) {
        query.token = token;
      }

      // Legacy client support: add delay option
      if (delay) {
        query.delay = delay;
      }

      let body: URLSearchParams | undefined;
      if (hasParams) {
        body = paramsToSearchParams(parameters);
      }

      return request(`${jobPath}/${endpoint}`, {
        method: 'POST',
        query,
        body,
      });
    },

    /**
     * Copies a job to a new name (optionally inside folders).
     *
     * **Important:** For the `from` argument, pass the *slashy* full name (e.g. `"a/b/src"`).
     * Do **not** normalize it to `/job/...` form, Jenkins expects the raw slash-separated name.
     * Only the *leaf* of the new job goes in the `?name=` query; parent folders are derived
     * from `name` and embedded in the URL path.
     *
     * @param name - Target job name (string or segments). Parent parts become folders; leaf is the new job name.
     * @param from - Source job’s slashy full name (e.g. `"folder/old"`).
     */
    copy: async (name: string | string[], from: string): Promise<void> => {
      const segments = parentSegments(name);
      const leaf = leafSegment(name);
      const folderPath = segments.length
        ? segments.map(normalizeJobName).join('/')
        : '';

      const url = folderPath ? `${folderPath}/createItem` : 'createItem';
      return request(url, {
        method: 'POST',
        query: {
          name: leaf,
          mode: 'copy',
          from: from, // Keep slashy!
        },
      });
    },

    /**
     * Creates a new job from an XML configuration payload.
     *
     * Only the *leaf* job name is sent in `?name=`; any parent segments become
     * folder parts embedded in the URL path.
     *
     * @param name - The destination job name (string or segments).
     * @param xml - The Jenkins job config.xml content.
     */
    create: async (name: string | string[], xml: string): Promise<void> => {
      const segments = parentSegments(name);
      const leaf = leafSegment(name);
      const folderPath = segments.length
        ? segments.map(normalizeJobName).join('/')
        : '';

      const url = folderPath ? `${folderPath}/createItem` : 'createItem';

      return request(url, {
        method: 'POST',
        query: { name: leaf },
        body: xml,
        contentType: 'application/xml',
      });
    },

    /**
     * Permanently deletes a job.
     *
     * @param name - The job name (string or segments).
     */
    destroy: async (name: string | string[]): Promise<void> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/doDelete`, { method: 'POST' });
    },

    /**
     * Enables a disabled job.
     *
     * @param name - The job name (string or segments).
     */
    enable: async (name: string | string[]): Promise<void> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/enable`, { method: 'POST' });
    },

    /**
     * Disables a job (prevents builds from being scheduled).
     *
     * @param name - The job name (string or segments).
     */
    disable: async (name: string | string[]): Promise<void> => {
      const jobPath = normalizeJobName(name);
      return request(`${jobPath}/disable`, { method: 'POST' });
    },
  };
}
