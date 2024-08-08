/** @jest-environment node */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { OptimizationsApiClientProxy } from '../OptimizationsApiClientProxy';
import { DiscoveryApi } from '../../generated/types/discovery';
import { GetRecommendationByIdRequest } from '../../models/requests';
import { makePlotsDataPropertyPathWithTerm } from './test-helpers';
import * as GetRecommendationByIdMockResponse from './fixtures/GetRecommendationByIdMockResponse.json';

const MOCK_BASE_URL = 'http://backstage:1234/api/proxy';
const mockDiscoveryApi: DiscoveryApi = {
  async getBaseUrl(_pluginId: string): Promise<string> {
    return MOCK_BASE_URL;
  },
};
const server = setupServer(
  http.get(`${MOCK_BASE_URL}/token`, _info =>
    HttpResponse.json({
      accessToken: 'hereisyourtokensir',
      expiresAt: 1234567890,
    }),
  ),
);

describe('OptimizationsApiClientProxy.ts', () => {
  let client: OptimizationsApiClientProxy;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    client = new OptimizationsApiClientProxy({
      discoveryApi: mockDiscoveryApi,
    });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getRecommendationById', () => {
    describe('responses', () => {
      it("should not transform the plotsData's date-string properties", async () => {
        expect.assertions(3);

        // Arrange
        server.use(
          http.get(
            `${MOCK_BASE_URL}/cost-management/v1/recommendations/openshift/:id`,
            _info => HttpResponse.json(GetRecommendationByIdMockResponse),
          ),
        );

        // Act
        const request: GetRecommendationByIdRequest = {
          path: { recommendationId: 'abcdef01-abcd-abcd-abcd-0123456789abc' },
          query: {},
        };
        const response = await client.getRecommendationById(request);
        const json = await response.json();

        // Assert
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm(
            'short',
            '2024-07-30T17:00:05.000Z',
          ),
        );
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm(
            'medium',
            '2024-07-25T11:00:05.000Z',
          ),
        );
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm('long', '2024-07-17T11:00:05.000Z'),
        );
      });

      it('should not transform to snake_case the recommendationId path parameter', async () => {
        expect.assertions(2);

        // Arrange
        const spyOnDefaultClientGetRecommendationById = jest.spyOn(
          // @ts-ignore (because defaultClient is private 🤫)
          client.defaultClient,
          'getRecommendationById',
        );
        server.use(
          http.get(
            `${MOCK_BASE_URL}/cost-management/v1/recommendations/openshift/:id`,
            _info => HttpResponse.json(GetRecommendationByIdMockResponse),
          ),
        );

        // Act
        const request: GetRecommendationByIdRequest = {
          path: { recommendationId: 'abcdef01-abcd-abcd-abcd-0123456789abc' },
          query: { cpuUnit: 'cores' },
        };
        await client.getRecommendationById(request);

        // Assert
        expect(
          spyOnDefaultClientGetRecommendationById.mock.lastCall?.[0],
        ).toHaveProperty('path.recommendationId');
        expect(
          spyOnDefaultClientGetRecommendationById.mock.lastCall?.[0],
        ).toHaveProperty('query.cpu_unit');
      });
    });
  });
});
