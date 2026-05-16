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

import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { Entity } from '@backstage/catalog-model';
import { SonarQubeClient } from './SonarQubeClient';
import { SummaryWrapper } from './types';
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';

function mockEntity(name: string): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'component',
    metadata: { name, namespace: 'default' },
  };
}

const fetchApi = {
  fetch: jest.fn(),
};

describe('SonarQubeClient', () => {
  const mockBaseUrl = 'http://backstage:9191/api/sonarqube';
  const discoveryApi = UrlPatternDiscovery.compile(mockBaseUrl);

  const setupHandlers = (summary: SummaryWrapper) => {
    fetchApi.fetch.mockImplementation(
      async (input: RequestInfo, _?: RequestInit) => {
        if (input.toString().includes('/entities/')) {
          return {
            ok: true,
            status: 200,
            json: async () => summary,
          };
        }
        return {
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not Found' }),
          statusText: 'Not Found',
          headers: new Headers(),
          url: input.toString(),
          text: async () => JSON.stringify({ message: 'Not Found' }),
        };
      },
    );
  };

  it('should report finding summary', async () => {
    setupHandlers({
      findings: {
        analysisDate: '2020-01-01T00:00:00Z',
        measures: [
          { metric: 'alert_status', value: 'OK' },
          { metric: 'bugs', value: '2' },
          { metric: 'reliability_rating', value: '3.0' },
          { metric: 'vulnerabilities', value: '4' },
          { metric: 'security_rating', value: '1.0' },
          { metric: 'security_hotspots_reviewed', value: '100' },
          { metric: 'security_review_rating', value: '1.0' },
          { metric: 'code_smells', value: '100' },
          { metric: 'sqale_rating', value: '2.0' },
          { metric: 'coverage', value: '55.5' },
          { metric: 'duplicated_lines_density', value: '1.0' },
        ],
      },
      instanceUrl: 'https://sonarcloud.io',
      componentKey: 'our:service',
    });

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });

    const summaries = await client.getSummaries([mockEntity('my-service')]);
    const summary = summaries[0];

    expect(summary).toEqual(
      expect.objectContaining({
        lastAnalysis: '2020-01-01T00:00:00Z',
        metrics: {
          alert_status: 'OK',
          bugs: '2',
          reliability_rating: '3.0',
          vulnerabilities: '4',
          security_rating: '1.0',
          security_hotspots_reviewed: '100',
          security_review_rating: '1.0',
          code_smells: '100',
          sqale_rating: '2.0',
          coverage: '55.5',
          duplicated_lines_density: '1.0',
        },
        projectUrl: 'https://sonarcloud.io/dashboard?id=our%3Aservice',
      }),
    );
    expect(summary?.getIssuesUrl('CODE_SMELL')).toEqual(
      'https://sonarcloud.io/project/issues?id=our%3Aservice&types=CODE_SMELL&resolved=false',
    );
    expect(summary?.getComponentMeasuresUrl('COVERAGE')).toEqual(
      'https://sonarcloud.io/component_measures?id=our%3Aservice&metric=coverage&resolved=false&view=list',
    );
  });

  it('should report finding summary (custom baseUrl)', async () => {
    setupHandlers({
      findings: {
        analysisDate: '2020-01-03T00:00:00Z',
        measures: [
          {
            metric: 'alert_status',
            value: 'ERROR',
          },
          {
            metric: 'bugs',
            value: '45',
          },
          {
            metric: 'reliability_rating',
            value: '5.0',
          },
        ],
      },
      instanceUrl: 'http://a.instance.local',
      componentKey: 'our:service',
    });

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });

    const summaries = await client.getSummaries([mockEntity('my-service')]);
    const summary = summaries[0];

    expect(summary).toEqual(
      expect.objectContaining({
        lastAnalysis: '2020-01-03T00:00:00Z',
        metrics: {
          alert_status: 'ERROR',
          bugs: '45',
          reliability_rating: '5.0',
        },
        projectUrl: 'http://a.instance.local/dashboard?id=our%3Aservice',
      }) as FindingSummary,
    );
    expect(summary?.getIssuesUrl('CODE_SMELL')).toEqual(
      'http://a.instance.local/project/issues?id=our%3Aservice&types=CODE_SMELL&resolved=false',
    );
    expect(summary?.getComponentMeasuresUrl('COVERAGE')).toEqual(
      'http://a.instance.local/component_measures?id=our%3Aservice&metric=coverage&resolved=false&view=list',
    );
  });

  it('should add identity token for logged in users', async () => {
    setupHandlers({
      findings: {
        analysisDate: '2020-01-01T00:00:00Z',
        measures: [],
      },
      instanceUrl: 'http://a.instance.local',
      componentKey: 'our:service',
    });

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });
    const summaries = await client.getSummaries([mockEntity('my-service')]);
    const summary = summaries[0];

    expect(summary?.lastAnalysis).toBe('2020-01-01T00:00:00Z');
  });

  describe('getSummaries', () => {
    const setupHandlersForGetSummaries = () => {
      fetchApi.fetch.mockImplementation(
        async (input: RequestInfo, _?: RequestInit) => {
          if (input.toString().includes('/entities/')) {
            const urlParts = input.toString().split('/entities/')[1].split('/');
            // urlParts = [kind, namespace, name, 'summary']
            const entityName = urlParts[2];
            if (entityName === 'unknown-entity') {
              return {
                ok: true,
                status: 200,
                json: async () =>
                  ({
                    findings: null,
                    instanceUrl: 'https://sonarcloud.io',
                    componentKey: 'unknown',
                  } as SummaryWrapper),
              };
            }
            const isComponent1 = entityName === 'component-1';
            const summary: SummaryWrapper = {
              findings: {
                analysisDate: isComponent1
                  ? '2020-01-01T00:00:00Z'
                  : '2020-01-02T00:00:00Z',
                measures: [
                  {
                    metric: 'alert_status',
                    value: isComponent1 ? 'OK' : 'ERROR',
                  },
                  {
                    metric: 'bugs',
                    value: isComponent1 ? '2' : '5',
                  },
                  {
                    metric: 'code_smells',
                    value: isComponent1 ? '100' : '200',
                  },
                ],
              },
              instanceUrl: 'https://sonarcloud.io',
              componentKey: isComponent1 ? 'component-1' : 'component-2',
            };
            return {
              ok: true,
              status: 200,
              json: async () => summary,
            };
          }
          return {
            ok: false,
            status: 404,
            json: async () => ({ message: 'Not Found' }),
            statusText: 'Not Found',
            headers: new Headers(),
            url: input.toString(),
            text: async () => JSON.stringify({ message: 'Not Found' }),
          };
        },
      );
    };

    beforeEach(() => {
      setupHandlersForGetSummaries();
    });

    it('should report finding summaries for multiple components', async () => {
      const client = new SonarQubeClient({
        discoveryApi,
        fetchApi,
      });

      const summaries = await client.getSummaries([
        mockEntity('component-1'),
        mockEntity('component-2'),
      ]);

      expect(summaries).toHaveLength(2);

      expect(summaries[0]).toEqual(
        expect.objectContaining({
          lastAnalysis: '2020-01-01T00:00:00Z',
          metrics: {
            alert_status: 'OK',
            bugs: '2',
            code_smells: '100',
          },
          projectUrl: 'https://sonarcloud.io/dashboard?id=component-1',
        }),
      );

      expect(summaries[1]).toEqual(
        expect.objectContaining({
          lastAnalysis: '2020-01-02T00:00:00Z',
          metrics: {
            alert_status: 'ERROR',
            bugs: '5',
            code_smells: '200',
          },
          projectUrl: 'https://sonarcloud.io/dashboard?id=component-2',
        }),
      );
    });

    it('should handle empty components array', async () => {
      const client = new SonarQubeClient({
        discoveryApi,
        fetchApi,
      });

      const summaries = await client.getSummaries([]);

      expect(summaries).toHaveLength(0);
    });

    it('should handle unknown entities with null findings', async () => {
      const client = new SonarQubeClient({
        discoveryApi,
        fetchApi,
      });

      const summaries = await client.getSummaries([
        mockEntity('component-1'),
        mockEntity('unknown-entity'),
      ]);

      expect(summaries).toHaveLength(2);
      expect(summaries[0]).toEqual(
        expect.objectContaining({
          projectUrl: 'https://sonarcloud.io/dashboard?id=component-1',
        }),
      );
      expect(summaries[1]).toBeUndefined();
    });
  });
});
