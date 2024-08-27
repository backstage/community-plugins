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
