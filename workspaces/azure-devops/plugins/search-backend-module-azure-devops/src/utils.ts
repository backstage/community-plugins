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
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export const getAxiosClient = (baseURL: string, authHeaderValue: string) => {
  const client = axios.create({
    baseURL,
    auth: { username: '', password: authHeaderValue },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return client;
};

export const buildBaseUrl = (
  baseUrl: string,
  organization: string,
  project: string,
  wikiIdentifier: string,
): string =>
  `${baseUrl}/${organization}/${project}/_apis/wiki/wikis/${wikiIdentifier}`;

export const convertStringToBase64 = (stringToConvert: string): string =>
  Buffer.from(stringToConvert).toString('base64');
