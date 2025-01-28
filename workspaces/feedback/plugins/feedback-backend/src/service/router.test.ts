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
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Config, ConfigReader } from '@backstage/config';

import express from 'express';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';

import {
  mockConfig,
  mockEntity,
  mockFeedback,
  mockJiraTicketDetailsResp,
  mockUser,
} from '../mocks';
import { createRouter } from './router';
import { NotificationService } from '@backstage/plugin-notifications-node';

const handlers = [
  rest.get(
    'http://**/api/catalog/entities/by-name/component/default/example-website',
    (_, res, ctx) => res(ctx.json(mockEntity)),
  ),
  rest.get(
    'http://**/api/catalog/entities/by-name/user/default/guest',
    (_, res, ctx) => res(ctx.json(mockUser)),
  ),
  rest.get('https://jira.host/rest/api/latest/issue/ticket-id', (_, res, ctx) =>
    res(ctx.json(mockJiraTicketDetailsResp)),
  ),
];

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

jest.mock('../database/feedbackStore', () => ({
  DatabaseFeedbackStore: {
    create: jest.fn().mockImplementation(() => {
      return {
        getFeedbackByUuid: () => Promise.resolve(mockFeedback),
        checkFeedbackId: (feedbackId: string) =>
          feedbackId === mockFeedback.feedbackId,
        getAllFeedbacks: () =>
          Promise.resolve({
            data: [mockFeedback],
            count: 1,
          }),
        storeFeedbackGetUuid: () =>
          Promise.resolve({
            feedbackId: mockFeedback.feedbackId,
            projectId: mockFeedback.projectId,
          }),
        updateFeedback: (data: any) => Promise.resolve(data),
        deleteFeedbackById: () => Promise.resolve(),
      };
    }),
  },
}));

describe('Router', () => {
  const mswMockServer = setupServer();
  handlers.forEach(handler => mswMockServer.use(handler));
  mswMockServer.listen({ onUnhandledRequest: 'bypass' });
  const config: Config = new ConfigReader(mockConfig);
  const discovery: DiscoveryService = mockServices.discovery();
  const notificationsMock: jest.Mocked<NotificationService> = {
    send: jest.fn(),
  };
  const logger: LoggerService = mockServices.rootLogger().child({
    service: 'feedback-backend',
  });
  const auth: AuthService = mockServices.auth();
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger,
      config: config,
      discovery: discovery,
      auth: auth,
      database: mockServices.database.mock(),
      notifications: notificationsMock,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('/\t\t\tshould return all feedbacks', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toEqual(200);
      expect(response.body.data[0]).toEqual(mockFeedback);
      expect(response.body.count).toEqual(1);
    });
    it('/:feedbackId\t\tshould return single feedback', async () => {
      const response = await request(app).get(`/${mockFeedback.feedbackId}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.data).toEqual(mockFeedback);
    });
    it('/:feedbackId\t\tshould give error', async () => {
      const response = await request(app).get(`/1234567890`);
      expect(response.statusCode).toEqual(404);
      expect(response.body.error).toEqual(
        'No feedback found for id 1234567890',
      );
    });
    it('/:feedbackId/ticket\tshould give error', async () => {
      const response = await request(app)
        .get(`/${mockFeedback.feedbackId}/ticket`)
        .query({
          ticketId: mockFeedback.ticketUrl?.split('/').pop(),
          projectId: mockFeedback.projectId,
        });
      expect(response.statusCode).toEqual(404);
      expect(response.body.error).toEqual(
        `Unable to fetch jira ticket ${mockFeedback.ticketUrl
          ?.split('/')
          .pop()}`,
      );
    });
    it('/:feedbackId/ticket\tshould return single feedback', async () => {
      mockEntity.metadata.annotations!['feedback/type'] = 'jira';
      const response = await request(app)
        .get(`/${mockFeedback.feedbackId}/ticket`)
        .query({
          ticketId: mockFeedback.ticketUrl?.split('/').pop(),
          projectId: mockFeedback.projectId,
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual('fetched successfully');
      expect(response.body.data.status).toEqual('Backlog');
      expect(response.body.data.assignee).toEqual('John Doe');
      mockEntity.metadata.annotations!['feedback/type'] = 'mail';
    });
  });

  describe('POST', () => {
    it('/\tshould give error', async () => {
      const response = await request(app)
        .post('/')
        .send({ description: mockFeedback.description });
      expect(response.body.error).toEqual('Summary field empty');
      expect(response.statusCode).toEqual(500);
    });
    it('/\tshould create feedback', async () => {
      const response = await request(app).post('/').send(mockFeedback);
      expect(response.body.message).toEqual('Issue created successfully');
      expect(response.body.data.feedbackId).toEqual(mockFeedback.feedbackId);
      expect(response.statusCode).toEqual(201);
      expect(notificationsMock.send).toHaveBeenCalledWith({
        payload: {
          description: 'Unit Test Issue',
          link: 'http://localhost:3000/catalog/default/Component/example-website/feedback',
          severity: 'normal',
          title: 'New issue for Example App',
          topic: 'feedback-component:default/example-website',
        },
        recipients: {
          entityRef: 'component:default/example-website',
          type: 'entity',
        },
      });
    });
  });

  describe('PATCH', () => {
    it('/:feedbackId\tshould return updated feedback', async () => {
      const response = await request(app)
        .patch(`/${mockFeedback.feedbackId}`)
        .send({ ...mockFeedback, summary: 'This is updated summmary' });
      expect(response.body.summary).not.toEqual(mockFeedback.summary);
      expect(response.statusCode).toEqual(200);
    });
    it('/:feedbackId\tshould give error', async () => {
      const response = await request(app)
        .patch(`/1234567890`)
        .send({ ...mockFeedback, summary: 'This is updated summmary' });
      expect(response.body.error).toEqual(
        'No feedback found for id 1234567890',
      );
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('DELETE', () => {
    it('/:feedbackId\tshould delete feedback', async () => {
      const response = await request(app).delete(`/${mockFeedback.feedbackId}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual('Deleted successfully');
    });
    it('/:feedbackId\tshould give error', async () => {
      const response = await request(app).delete(`/1234567890`);
      expect(response.statusCode).toEqual(404);
      expect(response.body.error).toEqual(
        'No feedback found for id 1234567890',
      );
    });
  });
});
