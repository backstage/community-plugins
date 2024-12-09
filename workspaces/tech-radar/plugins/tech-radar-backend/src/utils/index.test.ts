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
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { readTechRadarResponseFromURL } from './index';

const mockReadBuffer = jest.fn();
const mockUrlReader: UrlReaderService = {
  async readUrl(_: string) {
    return {
      buffer: mockReadBuffer,
      etag: '',
    };
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
      mockReadBuffer.mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            entries: [],
            quadrants: [],
            rings: [],
          }),
        ),
      );
      const buffer = await readTechRadarResponseFromURL(
        'https://example.com/tech-loader.json',
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(buffer).toBeDefined();
    });

    it('returns undefined if urlReader cannot get buffer from URL', async () => {
      mockReadBuffer.mockResolvedValue(undefined);
      const response = await readTechRadarResponseFromURL(
        'https://randomurl.com',
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });

    it('returns undefined if retrieved file contents cannot be parsed into JSON', async () => {
      mockReadBuffer.mockResolvedValue(Buffer.from('lorem ipsum'));
      const response = await readTechRadarResponseFromURL(
        'https://example.com/fetch.yaml',
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });

    it('returns undefined if retrieved file contents cannot be parsed into valid TechLoaderResponse JSON', async () => {
      mockReadBuffer.mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            names: [],
            description: '',
          }),
        ),
      );
      const response = await readTechRadarResponseFromURL(
        'https://example.com/non-tech-loader.json',
        mockUrlReader,
        mockServices.logger.mock(),
      );
      expect(response).toBeUndefined();
    });
  });
});
