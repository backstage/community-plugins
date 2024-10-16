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
import {
  UrlReaderService,
  UrlReaderServiceReadUrlResponse,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { readTechRadarResponseFromURL } from './index';

const validURL = 'https://example.com/tech-loader.json';
const fetchingYamlURL = 'https://example.com/fetch.yaml';
const fetchingBadJsonURL = 'https://example.com/non-tech-loader.json';
const bufferContent = Buffer.from(
  JSON.stringify({
    entries: [],
    quadrants: [],
    rings: [],
  }),
);
const nonJsonBufferContent = Buffer.from('lorem ipsum');
const invalidJsonBufferContent = Buffer.from(
  JSON.stringify({
    names: [],
    description: '',
  }),
);

const mockUrlReader: UrlReaderService = {
  readUrl(url: string) {
    switch (url) {
      case validURL:
        return Promise.resolve({
          buffer: () => Promise.resolve(bufferContent),
          etag: '',
        } as UrlReaderServiceReadUrlResponse);
      case fetchingYamlURL:
        return Promise.resolve({
          buffer: () => Promise.resolve(nonJsonBufferContent),
          etag: '',
        } as UrlReaderServiceReadUrlResponse);
      case fetchingBadJsonURL:
        return Promise.resolve({
          buffer: () => Promise.resolve(invalidJsonBufferContent),
          etag: '',
        } as UrlReaderServiceReadUrlResponse);
      default:
        throw new Error(`Unknown URL: ${url}`);
    }
  },
  readTree() {
    throw new Error('readTree not implemented.');
  },
  search() {
    throw new Error('search not implemented.');
  },
};

describe('Utils', () => {
  describe('readTechRadarResponseFromURL', () => {
    it('returns correctly parsed data when grabbing buffer from url reader', async () => {
      const buffer = await readTechRadarResponseFromURL(
        validURL,
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(buffer).toBeDefined();
    });

    it('returns undefined if urlReader cannot get buffer from URL', async () => {
      const response = await readTechRadarResponseFromURL(
        'https://randomurl.com',
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });

    it('returns undefined if retrieved file contents cannot be parsed into JSON', async () => {
      const response = await readTechRadarResponseFromURL(
        fetchingYamlURL,
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });

    it('returns undefined if retrieved file contents cannot be parsed into valid TechLoaderResponse JSON', async () => {
      const response = await readTechRadarResponseFromURL(
        fetchingBadJsonURL,
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });
  });
});
