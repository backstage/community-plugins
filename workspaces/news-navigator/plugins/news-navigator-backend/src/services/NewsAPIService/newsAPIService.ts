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
const NewsAPI = require('newsapi');

import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { NewsItem, NewsAPIResponse, NewsAPIService } from './types';

const REMOVED_NEWS_ITEM_TITLE: string = '[Removed]';

const removeDeletedNewsItems = (newsItems: NewsItem[]): NewsItem[] => {
  return newsItems.filter(
    (newsItem: NewsItem) =>
      newsItem.title !== REMOVED_NEWS_ITEM_TITLE &&
      newsItem.description !== REMOVED_NEWS_ITEM_TITLE,
  );
};

export async function createNewsAPIService({
  logger,
  config,
}: {
  auth: AuthService;
  logger: LoggerService;
  config: RootConfigService;
}): Promise<NewsAPIService> {
  logger.info('Initializing NewsAPIService');
  const apiKey = config.getString('newsAPI.apiKey');
  const newsapi = new NewsAPI(apiKey);

  return {
    async getNewsByCategory(category: string) {
      return newsapi.v2
        .topHeadlines({
          category,
          country: 'us',
        })
        .then((response: NewsAPIResponse) => {
          return removeDeletedNewsItems(response.articles);
        })
        .catch((error: Error) => {
          throw new InputError(
            `Failed to fetch news for category ${category}`,
            error,
          );
        });
    },

    async searchNewsByKeyword(keyword: string) {
      return newsapi.v2
        .everything({
          q: keyword,
        })
        .then((response: NewsAPIResponse) => {
          return removeDeletedNewsItems(response.articles);
        })
        .catch((error: Error) => {
          throw new InputError(
            `Failed to fetch news for keyword ${keyword}`,
            error,
          );
        });
    },
  };
}
