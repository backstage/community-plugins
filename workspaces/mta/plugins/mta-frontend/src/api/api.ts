import {
  DiscoveryApi,
  IdentityApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import {
  getCredentialsWithFallback,
  createAuthHeaders,
} from '../utils/credentials';

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
  public loginUrl: string;
  public shouldRedirect: boolean;

  constructor(loginUrl: string, shouldRedirect: boolean = true) {
    super(`Authentication required at ${loginUrl}`);
    this.name = 'AuthenticationError';
    this.loginUrl = loginUrl;
    this.shouldRedirect = shouldRedirect;

    // Redirect to login URL immediately if shouldRedirect is true
    if (shouldRedirect) {
      // Direct redirect without setTimeout
      window.location.href = loginUrl;
    }
  }

  // Helper method to handle authentication errors
  static handleAuthError(error: any): boolean {
    // Check if it's an authentication error
    if (error instanceof AuthenticationError) {
      // If the error has a login URL but shouldn't redirect automatically,
      // we can manually redirect here if needed
      if (!error.shouldRedirect && error.loginUrl) {
        // For now, we're not redirecting automatically to prevent navigation issues
        // We could log this, but avoiding console statements due to ESLint rules
        return true;
      }
    }
    return false;
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

export class DefaultMtaApi implements MTAApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  async getTasks(): Promise<TaskDashboard[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const credentialResult = await getCredentialsWithFallback(this.identityApi);

    const response = await fetch(`${url}/tasks`, {
      method: 'GET',
      headers: createAuthHeaders(credentialResult.token),
      referrerPolicy: 'no-referrer-when-downgrade',
      redirect: 'error',
    });

    if (response.status === 401) {
      const j = await response.json();
      // Redirect to login URL
      throw new AuthenticationError(j.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }

    return await response.json();
  }

  async updateApplication(application: Application): Promise<Application> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const credentialResult = await getCredentialsWithFallback(this.identityApi);

    const response = await fetch(`${url}/applications/${application.id}`, {
      method: 'PUT',
      headers: createAuthHeaders(credentialResult.token),
      body: JSON.stringify(application),
      referrerPolicy: 'no-referrer-when-downgrade',
    });

    if (response.status === 401) {
      const j = await response.json();
      // Redirect to login URL
      throw new AuthenticationError(j.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }

    // return await response.json();
    if (response.status === 204) {
      return application;
    }
    return application;
  }

  async getIdentities(): Promise<Identity[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const credentialResult = await getCredentialsWithFallback(this.identityApi);

    const response = await fetch(`${url}/identities`, {
      method: 'GET',
      headers: createAuthHeaders(credentialResult.token),
      referrerPolicy: 'no-referrer-when-downgrade',
      redirect: 'error',
    });

    if (response.status === 401) {
      const j = await response.json();
      // Redirect to login URL
      throw new AuthenticationError(j.loginURL);
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
        `Identities API failed with status ${response.status}: ${errorDetails}`,
        response.status,
      );
    }

    return await response.json();
  }

  async getTargets(): Promise<Target[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const credentialResult = await getCredentialsWithFallback(this.identityApi);

    const response = await fetch(`${url}/targets`, {
      method: 'GET',
      headers: createAuthHeaders(credentialResult.token),
      referrerPolicy: 'no-referrer-when-downgrade',
      redirect: 'error',
    });

    if (response.status === 401) {
      const j = await response.json();
      // Redirect to login URL
      throw new AuthenticationError(j.loginURL);
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
        `Targets API failed with status ${response.status}: ${errorDetails}`,
        response.status,
      );
    }

    return await response.json();
  }

  async analyzeMTAApplications(
    applicationId: number,
    analysisOptions: any,
  ): Promise<Application> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const credentialResult = await getCredentialsWithFallback(this.identityApi);

    const response = await fetch(
      `${url}/analyze-application/${applicationId}`,
      {
        method: 'POST',
        headers: createAuthHeaders(credentialResult.token),
        body: JSON.stringify(analysisOptions),
        referrerPolicy: 'no-referrer-when-downgrade',
      },
    );

    if (response.status === 401) {
      const jsonResponse = await response.json();
      // Redirect to login URL
      throw new AuthenticationError(jsonResponse.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }
    return await response.json();
  }

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }
}
