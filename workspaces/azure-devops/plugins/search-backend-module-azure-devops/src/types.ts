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

export const CONFIG_SECTION_NAME = 'search.collators.azureDevOpsWikiCollator';

export const DEFAULT_BASE_URL = 'https://dev.azure.com';

export type WikiArticleCollatorOptions = {
  organization?: string;
  project?: string;
  wikiIdentifier?: string;
  titleSuffix?: string;
};

export type WikiArticleCollatorFactoryOptions = {
  baseUrl?: string;
  /**
   * @deprecated Use `integrations.azure` in your app-config.yaml instead.
   * This field will be removed in a future release.
   */
  token?: string;
  credentialsProvider?: AzureDevOpsCredentialsProvider;
  wikis?: WikiArticleCollatorOptions[];
  logger: LoggerService;
};

export type WikiPageDetail = {
  id: number;
  path: string;
};

export type WikiPage = {
  id: number;
  gitItemPath: string;
  content: string;
  isNonConformant: boolean;
  isParentPage: boolean;
  order: number;
  path: string;
  remoteUrl: string;
  subPages: WikiPage[];
  url: string;
};
