import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { deepMapKeys } from '@y0n1/json/deep-map-keys';
import crossFetch from 'cross-fetch';
import camelCase from 'lodash/camelCase';
import { pluginId } from '../generated/pluginId';
import {
  DefaultApiClient,
  RequestOptions,
  TypedResponse,
} from '../generated/apis';
import type {
  GetRecommendationByIdRequest,
  GetRecommendationListRequest,
} from '../models/requests';
import type {
  RecommendationBoxPlots,
  RecommendationList,
  GetTokenResponse,
} from '../models/responses';
import { snakeCase } from 'lodash';

/** @public */
export type OptimizationsApi = Omit<
  InstanceType<typeof DefaultApiClient>,
  'fetchApi' | 'discoveryApi'
>;

/**
 * This class is a proxy for the original Optimizations client.
 * It provides the following additional functionality:
 *   1. Routes calls through the backend's proxy.
 *   2. Implements a token renewal mechanism.
 *   3. Handles case conversion
 *
 * @public
 */
export class OptimizationsApiClientProxy implements OptimizationsApi {
  private static requestKeysToSkip = {
    getRecommendationById: [/path\.recommendationId$/],
  };
  private static responseKeysToSkip = {
    getRecommendationById: [
      /recommendations\.recommendation_terms\.(long|medium|short)_term\.plots\.plots_data\."\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"$/,
    ],
  };

  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly defaultClient: DefaultApiClient;
  private token?: string;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi?: FetchApi }) {
    this.defaultClient = new DefaultApiClient({
      fetchApi: options.fetchApi,
      discoveryApi: {
        async getBaseUrl() {
          const baseUrl = await options.discoveryApi.getBaseUrl('proxy');
          return `${baseUrl}/cost-management/v1`;
        },
      },
    });
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi ?? { fetch: crossFetch };
  }

  public async getRecommendationById(
    request: GetRecommendationByIdRequest,
  ): Promise<TypedResponse<RecommendationBoxPlots>> {
    const snakeCaseTransformedRequest = deepMapKeys(
      request,
      snakeCase,
      OptimizationsApiClientProxy.requestKeysToSkip.getRecommendationById,
    ) as GetRecommendationByIdRequest;

    const response = await this.fetchWithToken(
      this.defaultClient.getRecommendationById,
      snakeCaseTransformedRequest,
    );

    return {
      ...response,
      json: async () => {
        const data = await response.json();
        const camelCaseTransformedResponse = deepMapKeys(
          data,
          camelCase,
          OptimizationsApiClientProxy.responseKeysToSkip.getRecommendationById,
        ) as RecommendationBoxPlots;
        return camelCaseTransformedResponse;
      },
    };
  }

  public async getRecommendationList(
    request: GetRecommendationListRequest,
  ): Promise<TypedResponse<RecommendationList>> {
    const snakeCaseTransformedRequest = deepMapKeys(
      request,
      snakeCase,
    ) as GetRecommendationListRequest;

    const response = await this.fetchWithToken(
      this.defaultClient.getRecommendationList,
      snakeCaseTransformedRequest,
    );

    return {
      ...response,
      json: async () => {
        const data = await response.json();
        const camelCaseTransformedResponse = deepMapKeys(
          data,
          camelCase,
        ) as RecommendationList;
        return camelCaseTransformedResponse;
      },
    };
  }

  private async getNewToken(): Promise<GetTokenResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl(`${pluginId}`);
    const response = await this.fetchApi.fetch(`${baseUrl}/token`);
    const data = (await response.json()) as GetTokenResponse;
    return data;
  }

  private async fetchWithToken<
    TRequest = GetRecommendationByIdRequest | GetRecommendationListRequest,
    TResponse = RecommendationBoxPlots | RecommendationList,
  >(
    asyncOp: DefaultApiClientOpFunc<TRequest, TResponse>,
    request: TRequest,
  ): Promise<TypedResponse<TResponse>> {
    if (!this.token) {
      const { accessToken } = await this.getNewToken();
      this.token = accessToken;
    }

    let response = await asyncOp.call(this.defaultClient, request, {
      token: this.token,
    });

    if (!response.ok) {
      if (response.status === 401) {
        const { accessToken } = await this.getNewToken();
        this.token = accessToken;

        response = await asyncOp.call(this.defaultClient, request, {
          token: this.token,
        });
      } else {
        throw new Error(response.statusText);
      }
    }

    return {
      ...response,
      json: async () => {
        const data = (await response.json()) as TResponse;
        return data;
      },
    };
  }
}

type DefaultApiClientOpFunc<
  TRequest = GetRecommendationByIdRequest | GetRecommendationListRequest,
  TResponse = RecommendationBoxPlots | RecommendationList,
> = (
  this: DefaultApiClient,
  request: TRequest,
  options?: RequestOptions,
) => Promise<TypedResponse<TResponse>>;
