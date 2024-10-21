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

import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    priority: {
      name: string;
    };
    issuetype: {
      description: string;
    };
    reporter: {
      displayName: string;
    };
    project: {
      key: string;
    };
  };
}

export interface JiraApi {
  listIssues: (
    jql: string,
    maxResults: number,
    startAt: number,
    username: string,
  ) => Promise<JiraIssue[]>;
}

type Options = {
  discoveryApi: DiscoveryApi;
  config: Config;
};

export class JiraApiClient implements JiraApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly token: string | undefined;
  private readonly config: Config;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.config = options.config;
    this.token = options.config.getOptionalString('backend.jira.token');
  }

  private async fetch<T = any>(
    input: string,
    username: string,
    init?: RequestInit,
  ): Promise<T> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const apiUrl = `${proxyUrl}/rest/api/latest${input}`;

    const response = await fetch(apiUrl, {
      ...init,
      headers: {
        ...init?.headers,
        Accept: 'application/json',
        Authorization: `Basic ${this.getEncodedCredentials(username)}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    console.log('Jira response: ', response);
    return await response.json();
  }

  private getEncodedCredentials(username: string): string {
    const jiraEmail = username || '';
    const jiraToken = this.token || '';

    if (!jiraEmail || !jiraToken) {
      throw new Error(
        'JIRA_API_TOKEN must be set in the configuration or environment variables',
      );
    }
    return Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
  }

  async listIssues(
    jql: string,
    maxResults: number,
    startAt: number,
    username: string,
  ): Promise<JiraIssue[]> {
    console.log(
      'jiraApiClient.listIssues: ',
      jql,
      maxResults,
      startAt,
      username,
    );
    const encodedJql = encodeURIComponent(jql);
    return this.fetch<JiraIssue[]>(
      `/search?jql=${encodedJql}&maxResults=${maxResults}&startAt=${startAt}`,
      username,
    );
  }
}
