import {
  DiscoveryApi,
  FetchApi,
  OAuthApi,
  createApiRef,
} from '@backstage/core-plugin-api';

export type TaskState =
  | 'not supported'
  | 'Canceled'
  | 'Created'
  | 'Succeeded'
  | 'Failed'
  | 'Running'
  | 'No task'
  | 'QuotaBlocked'
  | 'Ready'
  | 'Pending'
  | 'Postponed'
  | 'SucceededWithErrors';

export interface TaskDashboard {
  id: number;
  createUser: string;
  updateUser: string;
  createTime: string; // ISO-8601
  name: string;
  kind?: string;
  addon?: string;
  state: TaskState;
  application: Ref;
  started?: string; // ISO-8601
  terminated?: string; // ISO-8601

  /** Count of errors recorded on the task - even Succeeded tasks may have errors. */
  errors?: number;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface Metadata {
  target: string;
  source?: string;
  otherLabels?: string[];
}

export interface Rule {
  name: string;
  metadata?: Metadata;
  labels?: string[];
  file?: {
    id: number;
  };
}

export type Tags = {
  name: string;
  source: string;
  virtual: boolean;
};

export type Ref = {
  id: number;
  name: string;
};

export interface ITypeOptions {
  key: string;
  value: string;
}

export interface RulesetImage {
  id: number;
  name?: string;
}

export enum RulesetKind {
  CATEGORY = 'category',
}

export interface Repository {
  kind?: string;
  branch?: string;
  path?: string;
  url?: string;
}

export interface Ruleset {
  id?: number;
  kind?: RulesetKind;
  name?: string;
  description?: string;
  rules: Rule[];
  repository?: Repository;
  identity?: Ref;
}

export interface TargetLabel {
  name: string;
  label: string;
}

export interface Target {
  id: number;
  name: string;
  description?: string;
  choice?: boolean;
  custom?: boolean;
  labels?: TargetLabel[];
  image?: RulesetImage;
  ruleset: Ruleset;
  provider?: string;
}

export type IdentityKind =
  | 'source'
  | 'maven'
  | 'proxy'
  | 'basic-auth'
  | 'bearer';

export interface Identity {
  id: number;
  createUser?: string;
  updateUser?: string;
  createTime?: string;
  kind: IdentityKind;
  name: string;
  description?: string;
  user?: string;
  password?: string;
  key?: string;
  settings?: string;
}

export type Application = {
  id: number;
  name: string;
  description: string;
  businessService?: Ref;
  assessed: boolean;
  owner?: Ref;
  tags?: Tags[];
  effort?: number;
  risk?: number;
  comments?: string;
  binary?: string;
  bucket?: {
    id: string;
    name: string;
  };
  repository?: Repository;
  identities?: Ref[];
};

export interface MTAApi {
  getTargets(): Promise<Target[]>;
  getIdentities(): Promise<Identity[]>;
  analyzeMTAApplications(
    applicationId: number,
    analysisOptions: any,
  ): Promise<any>;
  updateApplication(application: Application): Promise<Application>;
  getTasks(): Promise<TaskDashboard[]>;
}

export const mtaApiRef = createApiRef<MTAApi>({
  id: 'plugin.mta',
});

/**
 * Helper to get the user's OIDC access token from Keycloak.
 * This token can be used directly for MTA Hub API calls.
 */
async function getOidcAccessToken(oidcAuthApi: OAuthApi): Promise<string> {
  try {
    // Get the access token from the OIDC provider (Keycloak)
    // This returns the raw Keycloak access token, not the Backstage identity token
    const token = await oidcAuthApi.getAccessToken(['openid', 'profile']);

    if (!token) {
      throw new AuthenticationError('No OIDC access token available');
    }

    return token;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new AuthenticationError(`Failed to get OIDC token: ${message}`);
  }
}

/**
 * Handle API response and throw appropriate errors.
 */
async function handleApiResponse<T>(
  response: Response,
  errorContext: string,
): Promise<T> {
  if (response.status === 401) {
    throw new AuthenticationError('Authentication required');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails = errorText;

    try {
      const errorJson = JSON.parse(errorText);
      errorDetails = errorJson.details || errorJson.error || errorText;
    } catch {
      // If parsing fails, use the raw text
    }

    throw new APIError(
      `${errorContext} failed with status ${response.status}: ${errorDetails}`,
      response.status,
    );
  }

  return response.json();
}

export class DefaultMtaApi implements MTAApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly oidcAuthApi: OAuthApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    oidcAuthApi: OAuthApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.oidcAuthApi = options.oidcAuthApi;
  }

  /**
   * Create headers with the Keycloak token in X-MTA-Authorization.
   * The fetchApi will automatically add the Backstage token to Authorization.
   */
  private async createMtaHeaders(): Promise<Record<string, string>> {
    const keycloakToken = await getOidcAccessToken(this.oidcAuthApi);
    return {
      'Content-Type': 'application/json',
      'X-MTA-Authorization': `Bearer ${keycloakToken}`,
    };
  }

  async getTasks(): Promise<TaskDashboard[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const headers = await this.createMtaHeaders();

    // fetchApi.fetch auto-adds Backstage token to Authorization header
    const response = await this.fetchApi.fetch(`${url}/tasks`, {
      method: 'GET',
      headers,
    });

    return handleApiResponse<TaskDashboard[]>(response, 'Tasks API');
  }

  async updateApplication(application: Application): Promise<Application> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const headers = await this.createMtaHeaders();

    const response = await this.fetchApi.fetch(
      `${url}/applications/${application.id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(application),
      },
    );

    if (response.status === 204) {
      return application;
    }

    return handleApiResponse<Application>(response, 'Update Application API');
  }

  async getIdentities(): Promise<Identity[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const headers = await this.createMtaHeaders();

    const response = await this.fetchApi.fetch(`${url}/identities`, {
      method: 'GET',
      headers,
    });

    return handleApiResponse<Identity[]>(response, 'Identities API');
  }

  async getTargets(): Promise<Target[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const headers = await this.createMtaHeaders();

    const response = await this.fetchApi.fetch(`${url}/targets`, {
      method: 'GET',
      headers,
    });

    return handleApiResponse<Target[]>(response, 'Targets API');
  }

  async analyzeMTAApplications(
    applicationId: number,
    analysisOptions: any,
  ): Promise<Application> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const headers = await this.createMtaHeaders();

    const response = await this.fetchApi.fetch(
      `${url}/analyze-application/${applicationId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(analysisOptions),
      },
    );

    return handleApiResponse<Application>(response, 'Analyze Application API');
  }
}
