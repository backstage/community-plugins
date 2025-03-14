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
import { mockServices } from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  mockConfig,
  mockCreateJiraTicketResp,
  mockFeedback,
  mockJiraTicketDetailsResp,
  mockJiraUsernameResp,
} from '../mocks';
import { JiraApiService } from './jiraApiService';

const handlers = [
  rest.post(
    'https://jira.host/rest/api/latest/issue',
    async (req, res, ctx) => {
      const reqData = await req.json();
      const key = reqData.fields.project.key;
      return res(ctx.json(mockCreateJiraTicketResp(key)));
    },
  ),
  rest.get('https://jira.host/rest/api/latest/user/search', (_, res, ctx) =>
    res(ctx.json(mockJiraUsernameResp)),
  ),
  rest.get('https://jira.host/rest/api/latest/issue/ticket-id', (_, res, ctx) =>
    res(ctx.json(mockJiraTicketDetailsResp)),
  ),
];
const logger: LoggerService = mockServices.rootLogger().child({
  service: 'feedback-backend',
});

describe('JIRA issue', () => {
  const mswMockServer = setupServer();
  handlers.forEach(handler => mswMockServer.use(handler));
  mswMockServer.listen({ onUnhandledRequest: 'warn' });
  const jiraHost = mockConfig.feedback.integrations.jira[0].host;
  const jiraToken = mockConfig.feedback.integrations.jira[0].token;
  const jiraService = new JiraApiService(jiraHost, jiraToken, logger);

  it('createJiraTicket', async () => {
    const data = await jiraService.createJiraTicket({
      projectKey: 'proj-key',
      summary: mockFeedback.summary!,
      description: 'Submitted from Test App',
      tag: mockFeedback.tag!,
      feedbackType: mockFeedback.feedbackType!,
      reporter: 'John Doe',
    });
    expect(data.key).toEqual('proj-key-01');
  });

  it('getJiraUsernameByEmail', async () => {
    const data = await jiraService.getJiraUsernameByEmail(
      'john.doe@example.com',
    );
    expect(data).toEqual('John Doe');
  });

  it('getTicketDetails', async () => {
    const data = await jiraService.getTicketDetails('ticket-id');
    expect(data?.status).toEqual('Backlog');
    expect(data?.assignee).toEqual('John Doe');
  });
});
