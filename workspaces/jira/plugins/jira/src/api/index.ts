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
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { Issue } from '../types';

/**
 * @public
 *
 * Reference to the Jira API service.
 *
 * This constant creates an API reference for the Jira service plugin,
 * which can be used to interact with Jira's API within the application.
 */
export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
});

const DEFAULT_PROXY_PATH = '/jira/api';
const DEFAULT_REST_API_VERSION = 'latest';

/**
 * @public
 *
 * Options type that defines the configuration for the API.
 */
export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  fetchApi: FetchApi;
};

/**
 * @public
 *
 * Jira API class
 */
export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly apiVersion: string;
  private readonly fetchApi: FetchApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;

    this.proxyPath = DEFAULT_PROXY_PATH;
    this.apiVersion = DEFAULT_REST_API_VERSION;
    this.fetchApi = options.fetchApi;
  }

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/rest/api/${this.apiVersion}/`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    };
  }

  private async sendJiraRequest(url: string, data: object = {}) {
    const request = await this.fetchApi.fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      if (request.status === 400) {
        throw new Error(
          'The Epic Key seems to be invalid. Please check and try again.',
        );
      } else {
        throw new Error(
          'Something went wrong. Please try again later or reach out to support.',
        );
      }
    }

    return request;
  }

  private async searchIssues(
    apiUrl: string,
    jql: string,
  ): Promise<Array<Issue>> {
    const url = `${apiUrl}search`;

    const data = {
      jql,
      fields: [
        'key',
        'labels',
        'issuetype',
        'summary',
        'status',
        'assignee',
        'created',
        'updated',
        'timespent',
      ],
    };

    const request = await this.sendJiraRequest(url, data);
    const response = await request.json();
    const issueDetails = response.issues;

    const res = issueDetails.map((issue: any) => {
      return {
        key: issue.key,
        summary: issue.fields.summary,
        assignee: issue.fields.assignee?.displayName,
        labels: issue.fields.labels,
        status: issue.fields.status,
        created: issue.fields.created,
        updated: issue.fields.updated,
      };
    });

    return res;
  }

  /**
   * Retrieves detailed information about issues in a Jira project, including their subtasks.
   *
   * @param projectKey - The key of the Jira project.
   * @param component - The component within the project to filter issues by.
   * @param label - The label to filter issues by.
   * @param epicKey - The key of the epic to filter issues by.
   * @returns A promise that resolves to an array of issues, each with their subtasks included.
   */
  async getIssueDetails(
    projectKey: string,
    component: string,
    label: string,
    epicKey: string,
  ) {
    const { apiUrl } = await this.getUrls();
    let jql = `project = "${projectKey}"
    ${component ? `AND component = "${component}"` : ''}
    ${label ? `AND labels in ("${label}")` : ''}
    AND issuetype = Story`;

    if (epicKey) {
      jql = `(key = ${epicKey}) OR (${jql} AND "Epic Link" = ${epicKey})`;
    }

    const res_stories = await this.searchIssues(apiUrl, jql);

    return Promise.all(
      res_stories.map(async story => {
        const jqlForSubtasks = `parent = ${story.key}`;
        const subtasks = await this.searchIssues(apiUrl, jqlForSubtasks);
        return { ...story, subtasks };
      }),
    );
  }

  /**
   * Fetches the activity stream from the Jira API.
   *
   * @param size - The maximum number of results to return.
   * @param ticketIds - An array of ticket IDs to filter the activity stream.
   * @param projectKey - (Optional) The project key to filter the activity stream.
   * @returns A promise that resolves to the activity stream data as a string.
   * @throws An error if the request fails.
   */
  async getActivityStream(
    size: number,
    ticketIds: string[],
    projectKey?: string,
  ) {
    const { baseUrl } = await this.getUrls();

    let filterUrl = `streams=key+IS+${projectKey}`;
    if (ticketIds) {
      filterUrl += `&streams=issue-key+IS+${ticketIds.join('+')}`;
    }

    const request = await this.fetchApi.fetch(
      `${baseUrl}/activity?maxResults=${size}&${filterUrl}`,
      {},
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    return request.text();
  }
}
