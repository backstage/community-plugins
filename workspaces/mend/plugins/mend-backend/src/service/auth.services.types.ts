export type MendConfig = {
  baseUrl: string;
  activationKey: string;
};

export type LoginSuccessResponseData = {
  additionalData: Record<string, unknown>;
  supportToken: string;
  response: {
    userUuid: string;
    userName: string;
    email: string;
    refreshToken: string;
    jwtTTL: number;
    sessionStartTime: number;
  };
};

export type RefreshAccessTokenSuccessResponseData = {
  additionalData: Record<string, unknown>;
  supportToken: string;
  response: {
    userUuid: string;
    username: string;
    email: string;
    jwtToken: string;
    tokenType: string;
    orgName: string;
    orgUuid: string;
    tokenTTL: number;
    sessionStartTime: number;
  };
};

export type JwtLicenceKeyPayload = {
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  wsEnvIdentifier: string;
  wsEnvUrl: string;
  orgToken: string;
  orgUuid: string;
  userKey: string;
  integratorEmail: string;
};

export type JwtAuthToken = {
  sub: string;
  email: string;
  uuid: string;
  orgName: string;
  orgUuid: string;
  domainName: string;
  domainUuid: string;
  tier: string;
  sessionStartTime: 1720348909448;
  correlationId: string;
  iat: 1720348939;
  exp: 1720350739;
};
