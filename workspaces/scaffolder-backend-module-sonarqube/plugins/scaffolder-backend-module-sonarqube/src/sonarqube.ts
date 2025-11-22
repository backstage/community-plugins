/*
 * Copyright 2024 The Backstage Authors
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
  private readonly authorizationHeader: string;

  constructor(options: SonarQubeClientOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
    const encoded = Buffer.from(`${this.token}:`).toString('base64');
    this.authorizationHeader = `Basic ${encoded}`;
  }

  async createProject(params: CreateProjectParams): Promise<{ key: string }> {
    const form = new URLSearchParams({
      name: params.name,
      project: params.project,
    });
    if (params.visibility) {
      form.append('visibility', params.visibility);
    }
    if (params.organization) {
      form.append('organization', params.organization);
    }

    const response = await fetch(`${this.baseUrl}/api/projects/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.authorizationHeader,
      },
      body: form.toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to create SonarQube project: ${response.statusText}${
          body ? ` - ${body}` : ''
        }`,
      );
    }

    return response.json() as Promise<{ key: string }>;
  }

  async generateToken(params: GenerateTokenParams): Promise<{ token: string }> {
    const form = new URLSearchParams({
      name: params.name,
      type: params.type,
      projectKey: params.projectKey,
    });
    if (params.organization) {
      form.append('organization', params.organization);
    }

    const response = await fetch(`${this.baseUrl}/api/user_tokens/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.authorizationHeader,
      },
      body: form.toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to generate token: ${response.statusText}${
          body ? ` - ${body}` : ''
        }`,
      );
    }

    return response.json() as Promise<{ token: string }>;
  }
}

export function createSonarQubeClient(
  options: SonarQubeClientOptions,
): SonarQubeClient {
  return new SonarQubeClient(options);
}
