import { getRootLogger, HostDiscovery } from '@backstage/backend-common';
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

const handlers = [
  rest.get(
    'http://localhost:7007/api/catalog/entities/by-name/component/default/example-website',
    (_, res, ctx) => res(ctx.json(mockEntity)),
  ),
  rest.get(
    'http://localhost:7007/api/catalog/entities/by-name/user/default/guest',
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
  const discovery: DiscoveryService = HostDiscovery.fromConfig(config);
  const logger: LoggerService = getRootLogger().child({
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
