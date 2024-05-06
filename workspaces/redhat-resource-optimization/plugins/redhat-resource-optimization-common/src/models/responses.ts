/**
 * This is a copy of GetTokenResponse, to avoid importing redhat-resource-optimization-backend.
 *
 * @public
 */
export interface GetTokenResponse {
  accessToken: string;
  /** The Unix Epoch at which the token will expire  */
  expiresAt: number;
}

export type {
  RecommendationBoxPlots,
  RecommendationList,
} from '../generated/models';
