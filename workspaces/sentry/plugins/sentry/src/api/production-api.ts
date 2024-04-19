/*
 * Copyright 2020 The Backstage Authors
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

import { SentryIssue } from './sentry-issue';
import { SentryApi } from './sentry-api';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { getProjectSlug, getOrganization } from './annotations';

/** @public */
export class ProductionSentryApi implements SentryApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly organization: string,
    private readonly identityApi?: IdentityApi,
  ) {}

  async fetchIssues(
    entity: Entity,
    options: {
      statsFor: string;
      query?: string;
    },
  ): Promise<SentryIssue[]> {
    const { query, statsFor } = options;

    const project = getProjectSlug(entity);
    const organization = getOrganization(entity) || this.organization;

    if (!project) {
      return [];
    }

    const apiUrl = `${await this.discoveryApi.getBaseUrl('proxy')}/sentry/api`;
    const authOpts = await this.authOptions();

    const queryPart = query ? `&query=${query}` : '';

    const response = await fetch(
      `${apiUrl}/0/projects/${organization}/${project}/issues/?statsPeriod=${statsFor}${queryPart}`,
      authOpts,
    );

    if (response.status >= 400 && response.status < 600) {
      throw new Error('Failed fetching Sentry issues');
    }

    return (await response.json()) as SentryIssue[];
  }

  private async authOptions() {
    if (!this.identityApi) {
      return {};
    }
    const { token } = await this.identityApi.getCredentials();
    return {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
  }
}
