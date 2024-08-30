import { OptimizationsApi } from '../client';

/** @public */
export type GetRecommendationByIdRequest = Parameters<
  OptimizationsApi['getRecommendationById']
>[0];

/** @public */
export type GetRecommendationListRequest = Parameters<
  OptimizationsApi['getRecommendationList']
>[0];
