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
import { LoggerService } from '@backstage/backend-plugin-api';

import axios from 'axios';

/**
 * @param host
 * @param authToken
 * @param logger
 * @param hostType
 */
export class JiraApiService {
  constructor(
    private host: string,
    private authToken: string,
    private logger: LoggerService,
    private hostType: string = 'SERVER',
  ) {}

  createJiraTicket = async (options: {
    projectKey: string;
    summary: string;
    description: string;
    tag: string;
    feedbackType: string;
    reporter?: string;
    jiraComponent?: string;
  }): Promise<any> => {
    const {
      projectKey,
      summary,
      description,
      tag,
      feedbackType,
      reporter,
      jiraComponent,
    } = options;
    const requestBody = {
      fields: {
        ...(reporter && {
          reporter: {
            name: reporter,
          },
        }),
        project: {
          key: projectKey,
        },
        summary: summary,
        description: description,
        labels: [
          'reported-by-backstage',
          tag.toLowerCase().split(' ').join('-'),
        ],
        issuetype: {
          name: feedbackType === 'BUG' ? 'Bug' : 'Task',
        },
        ...(jiraComponent && {
          components: [
            {
              name: jiraComponent,
            },
          ],
        }),
      },
    };
    try {
      const resp = await axios.post(
        `${this.host}/rest/api/latest/issue`,
        requestBody,
        {
          headers: {
            Authorization: this.authToken,
            'Content-Type': 'application/json',
          },
        },
      );
      return resp.data;
    } catch (err: any) {
      this.logger.error('Error:', err);
      return {};
    }
  };

  getJiraUsernameByEmail = async (
    reporterEmail: string,
  ): Promise<string | undefined> => {
    const resp = await axios.get(
      `${this.host}/rest/api/latest/user/search?${
        this.hostType === 'SERVER' ? 'username' : 'query'
      }=${reporterEmail}`,
      {
        headers: {
          Authorization: this.authToken,
          'Content-Type': 'application/json',
        },
      },
    );
    const data = resp.data;
    if (data.length === 0) return undefined;
    return data[0].name;
  };

  getTicketDetails = async (
    ticketId: string,
  ): Promise<
    { status: string; assignee: string; avatarUrls: {} } | undefined
  > => {
    const resp = await axios.get(
      `${this.host}/rest/api/latest/issue/${ticketId}`,
      {
        headers: {
          Authorization: this.authToken,
        },
      },
    );
    return {
      status: resp.data.fields.status.name,
      assignee: resp.data.fields.assignee
        ? resp.data.fields.assignee.displayName
        : null,
      avatarUrls: resp.data.fields.assignee
        ? resp.data.fields.assignee.avatarUrls
        : null,
    };
  };
}
