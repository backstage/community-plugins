import fetch from 'cross-fetch';

export interface SonarQubeClientOptions {
  baseUrl: string;
  token: string;
}

export interface CreateProjectParams {
  name: string;
  project: string;
  visibility?: 'public' | 'private';
  organization?: string;
}

export interface GenerateTokenParams {
  name: string;
  type: 'PROJECT_ANALYSIS_TOKEN';
  projectKey: string;
  organization?: string;
}

export class SonarQubeClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(options: SonarQubeClientOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
  }

  async createProject(params: CreateProjectParams): Promise<{ key: string }> {
    const response = await fetch(`${this.baseUrl}/api/projects/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create SonarQube project: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async generateToken(params: GenerateTokenParams): Promise<{ token: string }> {
    const response = await fetch(`${this.baseUrl}/api/user_tokens/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate token: ${response.statusText}`);
    }

    return response.json();
  }
}

export function createSonarQubeClient(
  options: SonarQubeClientOptions,
): SonarQubeClient {
  return new SonarQubeClient(options);
}
