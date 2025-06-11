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
import { SonarQubeClient } from './SonarQubeClient';
import { InstanceUrlWrapper, FindingsWrapper } from './types';
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';

const fetchApi = {
  fetch: jest.fn(),
};

describe('SonarQubeClient', () => {
  const mockBaseUrl = 'http://backstage:9191/api/sonarqube';
  const discoveryApi = UrlPatternDiscovery.compile(mockBaseUrl);

  const setupHandlers = (
    findings: FindingsWrapper,
    instanceUrlWrapper: InstanceUrlWrapper,
  ) => {
    fetchApi.fetch.mockImplementation(
      async (input: RequestInfo, _?: RequestInit) => {
        if (input.toString().includes('/findings')) {
          return {
            status: 200,
            json: async () => findings,
          };
        } else if (input.toString().includes('/instanceUrl')) {
          return {
            status: 200,
            json: async () => instanceUrlWrapper,
          };
        }
        return {
          status: 404,
          json: async () => {
            return {
              message: 'Not Found',
            };
          },
        };
      },
    );
  };

  it('should report finding summary', async () => {
    setupHandlers(
      {
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
      {
        instanceUrl: 'https://sonarcloud.io',
      },
    );

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });

    const summary = await client.getFindingSummary({
      componentKey: 'our:service',
    });

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
    setupHandlers(
      {
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
      {
        instanceUrl: 'http://a.instance.local',
      },
    );

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });

    const summary = await client.getFindingSummary({
      componentKey: 'our:service',
      projectInstance: 'custom',
    });

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
    setupHandlers(
      {
        analysisDate: '2020-01-01T00:00:00Z',
        measures: [],
      },
      {
        instanceUrl: 'http://a.instance.local',
      },
    );

    const client = new SonarQubeClient({
      discoveryApi,
      fetchApi,
    });
    const summary = await client.getFindingSummary({
      componentKey: 'our:service',
    });

    expect(summary?.lastAnalysis).toBe('2020-01-01T00:00:00Z');
  });

  describe('getFindingSummaries', () => {
    const setupHandlersForGetFindingSummaries = () => {
      fetchApi.fetch.mockImplementation(
        async (input: RequestInfo, _?: RequestInit) => {
          if (input.toString().includes('/findings')) {
            const componentKey = new URL(input.toString()).searchParams.get(
              'componentKey',
            );
            if (componentKey === 'unknown') {
              return {
                status: 200,
                json: '',
              };
            }
            const findings = {
              analysisDate:
                componentKey === 'component-1'
                  ? '2020-01-01T00:00:00Z'
                  : '2020-01-02T00:00:00Z',
              measures: [
                {
                  metric: 'alert_status',
                  value: componentKey === 'component-1' ? 'OK' : 'ERROR',
                },
                {
                  metric: 'bugs',
                  value: componentKey === 'component-1' ? '2' : '5',
                },
                {
                  metric: 'code_smells',
                  value: componentKey === 'component-1' ? '100' : '200',
                },
              ],
            } as FindingsWrapper;

            return {
              status: 200,
              json: async () => findings,
            };
          } else if (input.toString().includes('/instanceUrl')) {
            return {
              status: 200,
              json: async () => {
                return {
                  instanceUrl: 'https://sonarcloud.io',
                } as InstanceUrlWrapper;
              },
            };
          }
          return {
            status: 404,
            json: async () => {
              return {
                message: 'Not Found',
              };
            },
          };
        },
      );
    };

    beforeEach(() => {
      setupHandlersForGetFindingSummaries();
    });

    it('should report finding summaries for multiple components', async () => {
      const client = new SonarQubeClient({
        discoveryApi,
        fetchApi,
      });

      const summaries = await client.getFindingSummaries([
        { projectInstance: 'instance-1', componentKey: 'component-1' },
        { projectInstance: 'instance-2', componentKey: 'component-2' },
      ]);

      expect(summaries.size).toBe(2);

      const summary1 = summaries.get('component-1');
      expect(summary1).toEqual(
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

      const summary2 = summaries.get('component-2');
      expect(summary2).toEqual(
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

      const summaries = await client.getFindingSummaries([]);

      expect(summaries.size).toBe(0);
    });

    it('should handle incorrect component keys', async () => {
      const client = new SonarQubeClient({
        discoveryApi,
        fetchApi,
      });

      const summaries = await client.getFindingSummaries([
        { projectInstance: 'instance-1', componentKey: 'component-1' },
        { projectInstance: 'instance-2', componentKey: 'unknown' },
      ]);

      expect(summaries.size).toBe(1);
      const summary1 = summaries.get('component-1');
      expect(summary1).toEqual(
        expect.objectContaining({
          projectUrl: 'https://sonarcloud.io/dashboard?id=component-1',
        }),
      );
    });
  });
});
