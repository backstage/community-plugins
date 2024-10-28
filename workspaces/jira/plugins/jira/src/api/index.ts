/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
}

export interface JiraApi {
  getStoredIssues(): unknown;
  fetchAndStoreIssues(jql: string, arg1: number, arg2: number, username: string | undefined): { total: any; } | PromiseLike<{ total: any; }>;
  listIssues: (
    jql: string,
    maxResults: number,
    startAt: number,
  ) => Promise<JiraIssue[]>;
}

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export const jiraApiRef = createApiRef<JiraApi>({
  id: 'plugin.jira.service',
});

export class JiraApiClient implements JiraApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async getStoredIssues() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('jira');

    const response = await fetch(`${proxyUrl}/issues`);

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }
    return await response.json();
  }

  async fetchAndStoreIssues(
    jql: string,
    maxResults: number,
    startAt: number,
    username: string,
  ) {
    const proxyUrl = await this.discoveryApi.getBaseUrl('jira');
    const body = {
      jql,
      maxResults,
      startAt,
      username,
    };

    const response = await fetch(`${proxyUrl}/fetch-issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch and store issues: ${response.statusText}`,
      );
    }
    const responseJSON = await response.json();
    return responseJSON;
  }

  // Implementation of the listIssues method
  async listIssues(
    jql: string,
    maxResults: number,
    startAt: number,
  ): Promise<JiraIssue[]> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('jira');
    const response = await fetch(`${proxyUrl}/issues/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&startAt=${startAt}`);

    if (!response.ok) {
      throw new Error(`Failed to list issues: ${response.statusText}`);
    }
    const data = await response.json();
    return data.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
    }));
  }
}

