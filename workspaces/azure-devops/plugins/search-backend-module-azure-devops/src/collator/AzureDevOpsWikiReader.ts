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

import { AxiosInstance } from 'axios';
import { LoggerService } from '@backstage/backend-plugin-api';
import { WikiPageDetail, WikiPage } from '../types';
import { getAxiosClient, buildBaseUrl } from '../utils';

export class AzureDevOpsWikiReader {
  private readonly logger: LoggerService;
  private readonly axiosClient: AxiosInstance;
  private readonly organization: string;
  private readonly project: string;
  private readonly wikiIdentifier: string;
  public titleSuffix?: string;
  constructor(
    baseUrl: string,
    organization: string,
    project: string,
    token: string,
    wikiIdentifier: string,
    logger: LoggerService,
    titleSuffix?: string,
  ) {
    this.logger = logger;
    this.titleSuffix = titleSuffix;
    this.organization = organization;
    this.project = project;
    this.wikiIdentifier = wikiIdentifier;

    const builtUrl = buildBaseUrl(
      baseUrl,
      organization,
      project,
      wikiIdentifier,
    );

    this.axiosClient = getAxiosClient(builtUrl, token);
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
      const body: any = continuationToken !== null ? { continuationToken } : {};

      const response = await this.axiosClient.post(
        `/pagesBatch?api-version=6.0-preview.1`,
        JSON.stringify(body),
      );

      wikiPageDetails.push(...response.data.value);

      continuationToken = response.headers['x-ms-continuationtoken'];

      if (!continuationToken) {
        hasMorePages = false;
        this.logger.info(
          `Found ${wikiPageDetails.length} pages in wiki ${this.wikiIdentifier} in project ${this.project} in organization ${this.organization}`,
        );
      }
    }

    return wikiPageDetails;
  };

  readSingleWikiPage = async (id: number): Promise<WikiPage | undefined> => {
    let rawPageContent;
    try {
      const pageResponse = await this.axiosClient.get(
        `/pages/${id}?includeContent=true`,
      );

      rawPageContent = pageResponse.data;
      return rawPageContent;
    } catch (err) {
      this.logger.error(
        `Problem reading page with in wiki ${this.wikiIdentifier} with id ${id} - ${err} - ${rawPageContent}`,
      );
      throw err;
    }
  };
}
