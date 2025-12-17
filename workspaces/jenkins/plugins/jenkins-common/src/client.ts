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
import fetch from 'node-fetch';
import { createJobApi } from './client/jobApi';
import { createBuildApi } from './client/buildApi';
import { CrumbData, CrumbDataHeaderValues, HeaderValue } from './client/types';

import {
  addQueryParams,
  joinUrl,
  trimLeadingSlash,
  ensureTrailingSlash,
  safeExtractText,
} from './client/utils';

/** @public */
export interface JenkinsClientOptions {
  baseUrl: string; // e.g. "https://jenkins.example.com"
  crumbIssuer?: boolean | ((client: any) => Promise<CrumbData>) | undefined;
  headers?: Record<string, HeaderValue>;
  promisify?: boolean; // For compatibility with old legacy API, not used.
}

/** @public */
export class Jenkins {
  private crumbData?: CrumbData;
  public readonly opts: JenkinsClientOptions;

  constructor(opts: JenkinsClientOptions) {
    if (!opts.baseUrl) {
      throw new Error('Jenkins: opts.baseUrl is required');
    }

    // Legacy client behavior: set crumbIssuer to true if unset.
    if (opts.crumbIssuer === undefined) {
      opts.crumbIssuer = true;
    }

    // Legacy client behavior: set default headers and Referer
    // The referer here is the baseUrl.
    const referer = ensureTrailingSlash(opts.baseUrl);
    opts.headers = { referer, ...(opts.headers ?? {}) };

    this.opts = opts;
  }

  // Add APIs
  job = createJobApi({
    normalizeJobName: name => this.normalizeJobName(name),
    request: (path, opts) => this.request(path, opts),
  });

  build = createBuildApi({
    normalizeJobName: name => this.normalizeJobName(name),
    request: (path, opts) => this.request(path, opts),
  });

  /**
   * Retrieves and caches the Jenkins CSRF protection crumb.
   *
   * Jenkins uses a "crumb" (similar to a CSRF token) to protect write operations
   * such as POST requests. This method handles retrieving that crumb based on
   * the client's configuration.
   *
   * Behavior:
   * - If `crumbIssuer` is not enabled in the client options, it returns `undefined`.
   * - If a cached crumb already exists, it is returned immediately.
   * - If `crumbIssuer` is a function, that function is called to obtain the crumb.
   * - Otherwise, it performs a network request to
   *   `<baseUrl>/crumbIssuer/api/json` to fetch the crumb from Jenkins.
   *
   * The result is cached in `this.crumbData` for subsequent calls.
   *
   * @returns A `CrumbData` object containing the header name and value,
   *          or `undefined` if no crumb issuer is configured or the request fails.
   * @throws Any network or parsing errors that occur during the crumb fetch.
   */
  private async getCrumb(): Promise<CrumbData | undefined> {
    const { crumbIssuer } = this.opts;

    if (!crumbIssuer) {
      return undefined;
    }

    if (this.crumbData) {
      return this.crumbData;
    }

    if (typeof crumbIssuer === 'function') {
      this.crumbData = await crumbIssuer(this);
      return this.crumbData;
    }

    // Fetch crumb from Jenkins
    const res = await this.fetchRaw(
      `${ensureTrailingSlash(this.opts.baseUrl)}crumbIssuer/api/json`,
    );
    if (!res.ok) {
      return undefined;
    }
    const data = (await res.json()) as CrumbDataHeaderValues;
    this.crumbData = {
      headerName: data.crumbRequestField,
      headerValue: data.crumb,
    };

    return this.crumbData;
  }

  private async request(
    path: string,
    opts: {
      method?: string;
      query?: Record<string, string | number | undefined>;
      body?: any;
      rawText?: boolean;
      contentType?: string;
    } = {},
  ): Promise<any> {
    let url = new URL(
      joinUrl(ensureTrailingSlash(this.opts.baseUrl), trimLeadingSlash(path)),
    );
    if (opts.query) {
      url = addQueryParams(url, opts.query);
    }

    const method = (
      opts?.method || (opts?.body ? 'POST' : 'GET')
    ).toLocaleUpperCase('en-US');
    const headers: Record<string, HeaderValue> = {
      ...(this.opts.headers ?? {}),
    };

    // Legacy client support: Add crumb if request is not read-only
    if (method !== 'GET' && method !== 'HEAD') {
      const crumb = await this.getCrumb();
      if (crumb) {
        headers[crumb.headerName] = crumb.headerValue;
        // If the crumb call told us to include some cookies, merge them into
        // the existing cookie header
        if (crumb.cookies?.length) {
          const prior =
            typeof headers.cookie === 'string' ? headers.cookie : '';
          const extra = crumb.cookies.join('; ');
          headers.cookie = prior ? `${prior}; ${extra}` : extra;
        }
      }
    }

    // Set Content-Type, default to undefined if not set
    // Check caller-specified content-type first
    let resolvedContentType: string | undefined;
    if (opts?.contentType) {
      resolvedContentType = opts?.contentType;
    }

    // URLSearchParams -> x-www-form-urlencoded
    if (!resolvedContentType && opts?.body instanceof URLSearchParams) {
      resolvedContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    if (resolvedContentType) {
      headers['content-type'] = resolvedContentType;
    }

    const res = await this.fetchRaw(url.toString(), {
      method,
      headers,
      body: opts?.body,
    });

    if (!res.ok) {
      const text = await safeExtractText(res);
      throw new Error(
        `Jenkins API error ${res.status} ${method} ${url.toString()}: ${text}`,
      );
    }

    if (opts?.rawText) {
      return res.text();
    }

    const contentType = (
      res.headers.get('content-type') || ''
    ).toLocaleLowerCase('en-US');
    if (contentType.includes('application/json')) {
      return res.json();
    }

    return res.text();
  }

  private async fetchRaw(
    input: string,
    init?: {
      method?: string;
      headers?: Record<string, HeaderValue>;
      body?: any;
    },
  ) {
    // Flatten the values passed in "headers"
    const flattened: Record<string, string> = {};
    for (const [k, v] of Object.entries(init?.headers ?? {})) {
      if (Array.isArray(v)) {
        flattened[k] = v.join(', ');
      } else if (v === undefined) {
        continue;
      } else {
        flattened[k] = v;
      }
    }

    return fetch(input, {
      ...(init ?? {}),
      headers: flattened as any,
    });
  }

  /**
   * Normalizes a Jenkins job name into a fully qualified job path.
   *
   * Jenkins job URLs use a hierarchical format like:
   *   `/job/folder/job/subfolder/job/pipeline`
   *
   * This method takes a job name (either a string like `"folder/pipeline"`
   * or an array like `["folder", "pipeline"]`) and converts it into the proper
   * Jenkins API path format by inserting `job/` segments and URL-encoding
   * each component.
   *
   * - If the input already contains `/job/` segments, it is returned as-is
   *   (after trimming any leading slash).
   * - If the input is undefined, an error is thrown.
   *
   * @param name - The job name to normalize, either as a string or an array of path segments.
   * @returns The normalized Jenkins job path (e.g. `"job/folder/job/pipeline"`).
   * @throws If the name is undefined or empty.
   */
  private normalizeJobName(
    name: string | string[] | undefined,
  ): string | undefined {
    if (!name) {
      throw new Error('Jenkins.normalizeJobName: "name" is required');
    }

    const parts = Array.isArray(name) ? name : name.split('/').filter(Boolean);
    if (parts.join('/').includes('/job/')) {
      return trimLeadingSlash(Array.isArray(name) ? parts.join('/') : name);
    }

    return parts
      .map(encodeURIComponent)
      .map(s => `job/${s}`)
      .join('/');
  }
}
