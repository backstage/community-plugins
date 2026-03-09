/*
 * Copyright 2020 The Backstage Authors
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

import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { SonarqubeFindings } from './sonarqubeInfoProvider';
import { mockServices } from '@backstage/backend-test-utils';
import { Entity } from '@backstage/catalog-model';

describe('createRouter', () => {
  let app: express.Express;
  const getBaseUrlMock: jest.Mock<
    { baseUrl: string; externalBaseUrl?: string },
    [{ instanceName: string }]
  > = jest.fn();
  const getFindingsMock: jest.Mock<
    Promise<SonarqubeFindings | undefined>,
    [
      {
        componentKey: string;
        instanceName: string;
      },
    ]
  > = jest.fn();

  const catalogMock = {
    getEntityByRef: jest.fn(),
  };
  const httpAuthMock = {
    credentials: jest.fn().mockResolvedValue({ type: 'none' }),
  };

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockServices.rootLogger(),
      sonarqubeInfoProvider: {
        getBaseUrl: getBaseUrlMock,
        getFindings: getFindingsMock,
      },
      catalog: catalogMock as any,
      httpAuth: httpAuthMock as any,
    });
    app = express()
      .use(router)
      .use(
        (
          err: any,
          _req: express.Request,
          res: express.Response,
          _next: express.NextFunction,
        ) => {
          if (err.name === 'NotFoundError') {
            res.status(404).json({ error: err.message });
          } else if (err.name === 'InputError') {
            res.status(400).json({ error: err.message });
          } else {
            res
              .status(500)
              .json({ error: err.message || 'Internal Server Error' });
          }
        },
      );
  });

  beforeEach(() => {
    jest.resetAllMocks();
    httpAuthMock.credentials.mockResolvedValue({ type: 'none' });
  });

  describe('GET /entities/:kind/:namespace/:name/summary', () => {
    const DUMMY_KIND = 'component';
    const DUMMY_NAMESPACE = 'default';
    const DUMMY_NAME = 'my-service';
    const DUMMY_INSTANCE_URL = 'http://sonarqube-internal.example.com';
    const DUMMY_INSTANCE_EXTERNAL_URL = 'http://sonarqube.example.com';

    const makeEntity = (annotation: string): Entity => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: DUMMY_KIND,
      metadata: {
        name: DUMMY_NAME,
        namespace: DUMMY_NAMESPACE,
        annotations: { 'sonarqube.org/project-key': annotation },
      },
      spec: {},
    });

    it('returns findings and instanceUrl using annotation without instance', async () => {
      const measures: SonarqubeFindings = {
        analysisDate: '2022-01-01T00:00:00Z',
        measures: [{ metric: 'vulnerabilities', value: '54' }],
      };
      catalogMock.getEntityByRef.mockResolvedValue(makeEntity('my:component'));
      getFindingsMock.mockResolvedValue(measures);
      getBaseUrlMock.mockReturnValue({ baseUrl: DUMMY_INSTANCE_URL });

      const response = await request(app)
        .get(`/entities/${DUMMY_KIND}/${DUMMY_NAMESPACE}/${DUMMY_NAME}/summary`)
        .send();

      expect(catalogMock.getEntityByRef).toHaveBeenCalledWith(
        { kind: DUMMY_KIND, namespace: DUMMY_NAMESPACE, name: DUMMY_NAME },
        expect.objectContaining({ credentials: { type: 'none' } }),
      );
      expect(getFindingsMock).toHaveBeenCalledWith({
        componentKey: 'my:component',
        instanceName: undefined,
      });
      expect(getBaseUrlMock).toHaveBeenCalledWith({ instanceName: undefined });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        findings: measures,
        instanceUrl: DUMMY_INSTANCE_URL,
        componentKey: 'my:component',
      });
    });

    it('parses instance name and project key from annotation with slash', async () => {
      catalogMock.getEntityByRef.mockResolvedValue(
        makeEntity('myInstance/my:component'),
      );
      getFindingsMock.mockResolvedValue(undefined);
      getBaseUrlMock.mockReturnValue({
        baseUrl: DUMMY_INSTANCE_URL,
        externalBaseUrl: DUMMY_INSTANCE_EXTERNAL_URL,
      });

      const response = await request(app)
        .get(`/entities/${DUMMY_KIND}/${DUMMY_NAMESPACE}/${DUMMY_NAME}/summary`)
        .send();

      expect(getFindingsMock).toHaveBeenCalledWith({
        componentKey: 'my:component',
        instanceName: 'myInstance',
      });
      expect(getBaseUrlMock).toHaveBeenCalledWith({
        instanceName: 'myInstance',
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        findings: null,
        instanceUrl: DUMMY_INSTANCE_EXTERNAL_URL,
        componentKey: 'my:component',
      });
    });

    it('returns 404 when entity is not found', async () => {
      catalogMock.getEntityByRef.mockResolvedValue(undefined);

      const response = await request(app)
        .get(`/entities/${DUMMY_KIND}/${DUMMY_NAMESPACE}/${DUMMY_NAME}/summary`)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body).toMatchObject({
        error: expect.stringContaining('not found'),
      });
    });

    it('returns 400 when entity is missing the sonarqube annotation', async () => {
      catalogMock.getEntityByRef.mockResolvedValue({
        apiVersion: 'backstage.io/v1alpha1',
        kind: DUMMY_KIND,
        metadata: {
          name: DUMMY_NAME,
          namespace: DUMMY_NAMESPACE,
          annotations: {},
        },
        spec: {},
      });

      const response = await request(app)
        .get(`/entities/${DUMMY_KIND}/${DUMMY_NAMESPACE}/${DUMMY_NAME}/summary`)
        .send();

      expect(response.status).toEqual(400);
      expect(response.body).toMatchObject({
        error: expect.stringContaining('sonarqube.org/project-key'),
      });
    });
  });

  describe('GET /findings', () => {
    const DUMMY_COMPONENT_KEY = 'my:component';
    const DUMMY_INSTANCE_KEY = 'myInstance';

    it('returns ok', async () => {
      const measures = {
        analysisDate: '2022-01-01T00:00:00Z',
        measures: [{ metric: 'vulnerabilities', value: '54' }],
      };

      getFindingsMock.mockReturnValue(Promise.resolve(measures));
      const response = await request(app)
        .get('/findings')
        .query({
          componentKey: DUMMY_COMPONENT_KEY,
          instanceKey: DUMMY_INSTANCE_KEY,
        })
        .send();
      expect(getFindingsMock).toHaveBeenCalledTimes(1);
      expect(getFindingsMock).toHaveBeenCalledWith({
        componentKey: DUMMY_COMPONENT_KEY,
        instanceName: DUMMY_INSTANCE_KEY,
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(measures);
    });

    it('returns 400 when component key is not defined', async () => {
      const response = await request(app)
        .get('/findings')
        .query({
          instanceKey: DUMMY_INSTANCE_KEY,
        })
        .send();

      expect(response.status).toEqual(400);
    });

    it('use the value as instance name when instance key not provided', async () => {
      const measures = {
        analysisDate: '2021-04-08',
        measures: [{ metric: 'vulnerabilities', value: '54' }],
      };

      getFindingsMock.mockReturnValue(Promise.resolve(measures));
      const response = await request(app)
        .get('/findings')
        .query({
          componentKey: DUMMY_COMPONENT_KEY,
          instanceKey: undefined,
        })
        .send();

      expect(getFindingsMock).toHaveBeenCalledTimes(1);
      expect(getFindingsMock).toHaveBeenCalledWith({
        componentKey: DUMMY_COMPONENT_KEY,
        instanceName: undefined,
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(measures);
    });

    it('includes a Deprecation response header', async () => {
      getFindingsMock.mockResolvedValue(undefined);
      const response = await request(app)
        .get('/findings')
        .query({ componentKey: DUMMY_COMPONENT_KEY })
        .send();

      expect(response.status).toEqual(200);
      expect(response.headers.deprecation).toBe('true');
    });
  });

  describe('GET /instanceUrl', () => {
    const DUMMY_INSTANCE_KEY = 'myInstance';
    const DUMMY_INSTANCE_URL = 'http://sonarqube-internal.example.com';
    const DUMMY_INSTANCE_EXTERNAL_URL = 'http://sonarqube.example.com';

    it('returns ok', async () => {
      getBaseUrlMock.mockReturnValue({ baseUrl: DUMMY_INSTANCE_URL });
      const response = await request(app)
        .get('/instanceUrl')
        .query({
          instanceKey: DUMMY_INSTANCE_KEY,
        })
        .send();
      expect(getBaseUrlMock).toHaveBeenCalledTimes(1);
      expect(getBaseUrlMock).toHaveBeenCalledWith({
        instanceName: DUMMY_INSTANCE_KEY,
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ instanceUrl: DUMMY_INSTANCE_URL });
    });

    it('query default instance when instanceKey not provided', async () => {
      getBaseUrlMock.mockReturnValue({ baseUrl: DUMMY_INSTANCE_URL });
      const response = await request(app).get('/instanceUrl').send();
      expect(getBaseUrlMock).toHaveBeenCalledTimes(1);
      expect(getBaseUrlMock).toHaveBeenCalledWith({
        instanceName: undefined,
      });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ instanceUrl: DUMMY_INSTANCE_URL });
    });

    it('returns the external base url when provided', async () => {
      getBaseUrlMock.mockReturnValue({
        baseUrl: DUMMY_INSTANCE_URL,
        externalBaseUrl: DUMMY_INSTANCE_EXTERNAL_URL,
      });
      const response = await request(app).get('/instanceUrl').send();
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        instanceUrl: DUMMY_INSTANCE_EXTERNAL_URL,
      });
    });

    it('includes a Deprecation response header', async () => {
      getBaseUrlMock.mockReturnValue({ baseUrl: DUMMY_INSTANCE_URL });
      const response = await request(app).get('/instanceUrl').send();

      expect(response.status).toEqual(200);
      expect(response.headers.deprecation).toBe('true');
    });
  });
});
