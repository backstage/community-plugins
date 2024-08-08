export interface GetTokenResponse {
  accessToken: string;
  /** The Unix Epoch at which the token will expire  */
  expiresAt: number;
}
