/*
 * Copyright 2026 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { createRouter } from './router';

const createLogger = () =>
  ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  } as any);

describe('createRouter', () => {
  it('returns 400 when the entity does not contain the Checkmarx annotation', async () => {
    const router = await createRouter({
      logger: createLogger(),
      checkmarxInfoProvider: {
        getSummary: jest.fn(),
      },
      catalog: {
        getEntityByRef: jest.fn().mockResolvedValue({
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'service-a',
          },
          spec: {
            type: 'service',
            lifecycle: 'production',
            owner: 'guests',
          },
        } as Entity),
      } as any,
      httpAuth: {
        credentials: jest.fn().mockResolvedValue({}),
      } as any,
    });

    const app = express();
    app.use(router);
    app.use((error: any, _req: any, res: any, _next: any) => {
      let status = error.statusCode ?? 500;
      if (error.name === 'InputError') {
        status = 400;
      } else if (error.name === 'NotFoundError') {
        status = 404;
      }
      res.status(status).json({ error: error.message });
    });

    const response = await request(app).get(
      '/entities/Component/default/service-a/summary',
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('checkmarx.org/project-id');
  });

  it('returns the normalized summary when the entity is valid', async () => {
    const getSummary = jest.fn().mockResolvedValue({
      projectId: 'project-123',
      branch: 'main',
      scanId: 'scan-1',
      scanUrl: 'https://us.ast.checkmarx.net/projects/project-123/scans',
      lastUpdated: '2026-05-20T00:00:00.000Z',
      engines: ['sast'],
      metrics: {
        sastFindings: 4,
        criticalHighFindings: 0,
        scaPackages: 0,
        outdatedPackages: 0,
        recurrentFindings: 0,
        recurrentFindingsPercent: 0,
        additionalFindings: 0,
        oldestAgeLabel: null,
      },
      counters: {
        sast: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 4,
        },
        kics: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 0,
        },
        sca: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 0,
        },
        scaPackages: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 0,
          outdatedCounter: 0,
          riskLevelCounters: [],
          licenseCounters: [],
        },
        apiSec: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 0,
        },
        containers: {
          severityCounters: [],
          statusCounters: [],
          stateCounters: [],
          ageCounters: [],
          totalCounter: 0,
        },
      },
    });

    const router = await createRouter({
      logger: createLogger(),
      checkmarxInfoProvider: { getSummary },
      catalog: {
        getEntityByRef: jest.fn().mockResolvedValue({
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'service-a',
            annotations: {
              'checkmarx.org/project-id': 'project-123',
              'checkmarx.org/default-branch': 'main',
            },
          },
          spec: {
            type: 'service',
            lifecycle: 'production',
            owner: 'guests',
          },
        } as Entity),
      } as any,
      httpAuth: {
        credentials: jest.fn().mockResolvedValue({}),
      } as any,
    });

    const app = express();
    app.use(router);

    const response = await request(app).get(
      '/entities/Component/default/service-a/summary',
    );

    expect(response.status).toBe(200);
    expect(response.body.projectId).toBe('project-123');
    expect(getSummary).toHaveBeenCalledWith({
      projectId: 'project-123',
      defaultBranch: 'main',
    });
  });
});
