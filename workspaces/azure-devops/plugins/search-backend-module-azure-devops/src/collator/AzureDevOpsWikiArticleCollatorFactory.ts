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
import { Config } from '@backstage/config';
import { AzureDevOpsCredentialsProvider } from '@backstage/integration';
import { Readable } from 'stream';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import {
  CONFIG_SECTION_NAME,
  DEFAULT_BASE_URL,
  WikiArticleCollatorFactoryOptions,
  WikiArticleCollatorOptions,
  WikiPage,
} from '../types';
import { AzureDevOpsWikiReader } from './AzureDevOpsWikiReader';

export class AzureDevOpsWikiArticleCollatorFactory
  implements DocumentCollatorFactory
{
  private readonly baseUrl: string;
  private readonly logger: LoggerService;
  private readonly credentialsProvider?: AzureDevOpsCredentialsProvider;
  /**
   * @deprecated Use `credentialsProvider` instead.
   */
  private readonly token: string | undefined;
  private readonly wikis: WikiArticleCollatorOptions[] | undefined;
  public readonly type: string = 'azure-devops-wiki-article';

  private constructor(options: WikiArticleCollatorFactoryOptions) {
    this.baseUrl = (options.baseUrl?.trim() || DEFAULT_BASE_URL).replace(
      /\/+$/,
      '',
    );
    this.token = options.token;
    this.credentialsProvider = options.credentialsProvider;
    this.logger = options.logger;
    this.wikis = options.wikis;
  }

  static fromConfig(
    config: Config,
    options: WikiArticleCollatorFactoryOptions,
  ) {
    const baseUrl = config.getOptionalString(`${CONFIG_SECTION_NAME}.baseUrl`);
    const token = config.getOptionalString(`${CONFIG_SECTION_NAME}.token`);
    const wikisConfig = config.getOptionalConfigArray(
      `${CONFIG_SECTION_NAME}.wikis`,
    );

    const wikis = wikisConfig?.map(wikiConfig => {
      return {
        organization: wikiConfig.getString('organization'),
        project: wikiConfig.getString('project'),
        wikiIdentifier: wikiConfig.getString('wikiIdentifier'),
        titleSuffix: wikiConfig.getOptionalString('titleSuffix'),
      };
    });

    return new AzureDevOpsWikiArticleCollatorFactory({
      ...options,
      baseUrl,
      token,
      wikis,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<IndexableDocument> {
    if (this.validateNecessaryConfigurationOptions() === false) {
      return;
    }

    if (this.token) {
      this.logger.warn(
        `The 'token' configuration for ${CONFIG_SECTION_NAME} is deprecated. ` +
          "Configure credentials under 'integrations.azure' in your app-config.yaml instead. " +
          'This supports PATs, service principals, and managed identities. ' +
          'The token field will be removed in a future release. ' +
          'See https://backstage.io/docs/integrations/azure/locations for details.',
      );
    }

    const articles: (IndexableDocument | null)[] =
      await this.readAllArticlesFromAllWikis();

    for (const article of articles) {
      if (article === null || article === undefined) {
        continue;
      }
      yield article;
    }

    this.logger.info('Done indexing Azure DevOps wiki documents');
  }

  private validateNecessaryConfigurationOptions(): boolean {
    if (this.wikis === undefined) {
      this.logger.error(`No wikis configured in your app-config.yaml`);
      return false;
    }

    if (!this.token && !this.credentialsProvider) {
      this.logger.error(
        `No credentials available: configure 'integrations.azure' in your app-config.yaml ` +
          `or provide a '${CONFIG_SECTION_NAME}.token' (deprecated). ` +
          'See https://backstage.io/docs/integrations/azure/locations for details.',
      );
      return false;
    }

    if (
      [
        ...this.wikis.flatMap((wiki, index) => {
          return [
            this.validateSingleConfigurationOptionExists(
              wiki.organization,
              `${CONFIG_SECTION_NAME}.wikis[${index}].organization`,
            ),
            this.validateSingleConfigurationOptionExists(
              wiki.project,
              `${CONFIG_SECTION_NAME}.wikis[${index}].project`,
            ),
            this.validateSingleConfigurationOptionExists(
              wiki.wikiIdentifier,
              `${CONFIG_SECTION_NAME}.wikis[${index}].wikiIdentifier`,
            ),
          ];
        }),
      ].some(result => !result)
    ) {
      return false;
    }

    return true;
  }

  private async readAllArticlesFromAllWikis(): Promise<
    (IndexableDocument | null)[]
  > {
    const promises: Promise<(IndexableDocument | null)[]>[] = [];
    this.wikis?.forEach(wiki =>
      promises.push(this.readAllArticlesFromSingleWiki(wiki)),
    );

    const settledPromises = await Promise.allSettled(promises);
    const fulfilledPromises = settledPromises.filter(
      p => p.status === 'fulfilled',
    ) as PromiseFulfilledResult<(IndexableDocument | null)[]>[];
    const articles = fulfilledPromises.flatMap(p => p.value);
    return articles;
  }

  private async readAllArticlesFromSingleWiki(
    wiki: WikiArticleCollatorOptions,
  ): Promise<(IndexableDocument | null)[]> {
    const reader = new AzureDevOpsWikiReader({
      baseUrl: this.baseUrl,
      organization: wiki.organization as string,
      project: wiki.project as string,
      wikiIdentifier: wiki.wikiIdentifier as string,
      logger: this.logger,
      titleSuffix: wiki.titleSuffix,
      token: this.token,
      credentialsProvider: this.credentialsProvider,
    });

    const listOfAllArticles = await reader.getListOfAllWikiPages();
    this.logger.info(
      `Indexing ${listOfAllArticles.length} Azure DevOps wiki documents`,
    );

    const batchSize = 100;

    const settledPromises: PromiseSettledResult<WikiPage | undefined>[] = [];

    while (listOfAllArticles.length) {
      settledPromises.push(
        ...(await Promise.allSettled(
          listOfAllArticles
            .splice(0, batchSize)
            .map(article => reader.readSingleWikiPage(article.id)),
        )),
      );
    }

    const result = settledPromises
      .map(p => {
        const article = p.status === 'fulfilled' ? p.value : null;
        if (article === null || article === undefined) {
          return null;
        }
        const splitPath = article?.path?.split('/');
        const title = splitPath?.[splitPath.length - 1] ?? 'Unknown Title';

        return {
          title: `${title}${reader.titleSuffix ?? ''}`,
          location: article?.remoteUrl ?? '',
          text: article?.content ?? '',
        };
      })
      .filter(article => article !== null);

    return result;
  }

  private validateSingleConfigurationOptionExists(
    option: string | undefined,
    optionName: string,
  ): boolean {
    if (option === undefined) {
      this.logger.error(`No ${optionName} configured in your app-config.yaml`);
      return false;
    }

    return true;
  }
}
