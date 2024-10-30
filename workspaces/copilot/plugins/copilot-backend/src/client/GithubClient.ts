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

import { ResponseError } from '@backstage/errors';
import { Metric } from '@backstage-community/plugin-copilot-common';
import fetch from 'node-fetch';
import {
  CopilotCredentialsProvider,
  GithubInfo,
} from '../utils/CopilotCredentialsProvider';

interface GithubApi {
  getCopilotUsageDataForEnterprise: () => Promise<Metric[]>;
}

export class GithubClient implements GithubApi {
  constructor(private readonly props: GithubInfo) {}

  static async fromConfig(credentialsProvider: CopilotCredentialsProvider) {
    const info = await credentialsProvider.getCredentials();
    return new GithubClient(info);
  }

  async getCopilotUsageDataForEnterprise(): Promise<Metric[]> {
    const path = `/enterprises/${this.props.enterprise}/copilot/usage`;
    return this.get(path);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.props.apiBaseUrl}${path}`, {
      headers: {
        ...this.props.credentials.headers,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
