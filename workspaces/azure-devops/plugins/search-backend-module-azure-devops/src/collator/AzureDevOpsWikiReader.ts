/*
 * Copyright 2025 The Backstage Authors
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

import { LoggerService } from '@backstage/backend-plugin-api';
import { AzureDevOpsCredentialsProvider } from '@backstage/integration';
import { WikiPageDetail, WikiPage } from '../types';
import { buildBaseUrl, convertStringToBase64, fetchWithRetry } from '../utils';

interface AzureDevOpsWikiReaderOptions {
  baseUrl: string;
  organization: string;
  project: string;
  wikiIdentifier: string;
  logger: LoggerService;
  titleSuffix?: string;
  /**
   * @deprecated Use `credentialsProvider` instead. This field will be removed
   * in a future release.
   */
  token?: string;
  credentialsProvider?: AzureDevOpsCredentialsProvider;
}

export class AzureDevOpsWikiReader {
  private readonly logger: LoggerService;
  private readonly baseUrl: string;
  private readonly organization: string;
  private readonly project: string;
  private readonly wikiIdentifier: string;
  private readonly token?: string;
  private readonly credentialsProvider?: AzureDevOpsCredentialsProvider;
  public titleSuffix?: string;

  constructor(options: AzureDevOpsWikiReaderOptions) {
    this.baseUrl = options.baseUrl;
    this.organization = options.organization;
    this.project = options.project;
    this.wikiIdentifier = options.wikiIdentifier;
    this.logger = options.logger;
    this.titleSuffix = options.titleSuffix;
    this.token = options.token;
    this.credentialsProvider = options.credentialsProvider;
  }

  getListOfAllWikiPages = async () => {
    this.logger.info(
      `Retrieving list of all Azure DevOps wiki pages for wiki ${this.wikiIdentifier} in project ${this.project} in organization ${this.organization}`,
    );

    const wikiPageDetails: WikiPageDetail[] = [];

    let hasMorePages = true;
    let continuationToken: string | null = null;

    this.logger.info(`Reading ADO wiki pages from wiki ${this.wikiIdentifier}`);

    while (hasMorePages) {
      const body = continuationToken !== null ? { continuationToken } : {};

      const response = await this.fetch(
        'pagesBatch?api-version=6.0-preview.1',
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-type': 'application/json' },
        },
      );

      const data = (await response.json()) as { value: WikiPageDetail[] };

      for (const item of data.value) {
        wikiPageDetails.push(item);
      }

      continuationToken = response.headers.get('x-ms-continuationtoken');

      if (!continuationToken) {
        hasMorePages = false;
        this.logger.info(
          `Found ${wikiPageDetails.length} pages in wiki ${this.wikiIdentifier} in project ${this.project} in organization ${this.organization}`,
        );
      }
    }

    return wikiPageDetails;
  };

  readSingleWikiPage = async (id: number): Promise<WikiPage> => {
    let rawPageContent;
    try {
      const pageResponse = await this.fetch(`/pages/${id}?includeContent=true`);

      rawPageContent = await pageResponse.json();
      return rawPageContent;
    } catch (err) {
      this.logger.error(
        `Problem reading page with in wiki ${this.wikiIdentifier} with id ${id} - ${err} - ${rawPageContent}`,
      );
      throw err;
    }
  };

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.token) {
      const credentials = convertStringToBase64(`:${this.token}`);
      return { Authorization: `Basic ${credentials}` };
    }

    if (this.credentialsProvider) {
      const orgUrl = `${this.baseUrl}/${this.organization}`;
      const credentials = await this.credentialsProvider.getCredentials({
        url: orgUrl,
      });

      if (credentials) {
        return credentials.headers;
      }

      throw new Error(
        `No credentials found for Azure DevOps organization at ${orgUrl}. ` +
          "Check your 'integrations.azure' configuration in app-config.yaml. " +
          'See https://backstage.io/docs/integrations/azure/locations for details.',
      );
    }

    throw new Error(
      'No authentication configured. Provide either a token or credentials provider.',
    );
  }

  private fetch: typeof fetchWithRetry = async (url, options) => {
    const authHeaders = await this.getAuthHeaders();

    return fetchWithRetry(
      `${buildBaseUrl(
        this.baseUrl,
        this.organization,
        this.project,
        this.wikiIdentifier,
      )}/${url}`,
      {
        ...options,
        headers: { ...options?.headers, ...authHeaders },
      },
    );
  };
}
