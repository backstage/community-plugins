/*
 * Copyright 2022 The Backstage Authors
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

import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import {
  CacheService,
  LoggerService,
  UrlReaderService,
  UrlReaderServiceReadTreeResponse,
  UrlReaderServiceReadTreeResponseFile,
  UrlReaderServiceReadUrlResponse,
} from '@backstage/backend-plugin-api';
import { NotModifiedError } from '@backstage/errors';
import { AdrInfoParser } from '@backstage-community/plugin-adr-common';

const listEndpointName = '/list';
const fileEndpointName = '/file';
const imageEndpointName = '/image';

const makeBufferFromString = (string: string) => async () =>
  Buffer.from(string);

const makeEtagFromString = (string: string) => {
  const crypto = require('crypto');
  return crypto.createHash('md5', string).digest('hex');
};

const testingUrlFakeFileTree: UrlReaderServiceReadTreeResponseFile[] = [
  {
    path: 'folder/testFile001.txt',
    content: makeBufferFromString('folder/testFile001.txt content'),
  },
  {
    path: 'testFile001.txt',
    content: makeBufferFromString('testFile002.txt content'),
  },
  {
    path: 'testFile002.txt',
    content: makeBufferFromString('testFile001.txt content'),
  },
  {
    path: '.gitkeep',
    content: makeBufferFromString(''),
  },
];

const makeFileContent = async (fileContent: string) => {
  const result: UrlReaderServiceReadUrlResponse = {
    buffer: makeBufferFromString(fileContent),
    etag: makeEtagFromString(fileContent),
  };
  return result;
};

const testFileOneContent = 'testFileOne content';
const testFileTwoContent = 'testFileTwo content';
const genericFileContent = 'file content';
const testImageContent = 'image content';

const mockUrlReader: UrlReaderService = {
  readUrl(url: string) {
    switch (url) {
      case 'testFileOne':
        return makeFileContent(testFileOneContent);
      case 'testFileTwo':
        return makeFileContent(testFileTwoContent);
      case 'testImage.png':
        return makeFileContent(testImageContent);
      default:
        return makeFileContent(genericFileContent);
    }
  },
  readTree() {
    const result: UrlReaderServiceReadTreeResponse = {
      files: async () => testingUrlFakeFileTree,
      archive() {
        throw new Error('Function not implemented.');
      },
      dir() {
        throw new Error('Function not implemented.');
      },
      etag: '',
    };

    const resultPromise = async () => result;
    return resultPromise();
  },
  search() {
    throw new Error('search not implemented.');
  },
};

class MockCacheClient implements CacheService {
  private itemRegistry: { [key: string]: any };

  constructor() {
    this.itemRegistry = {};
  }

  async get(key: string) {
    return this.itemRegistry[key];
  }

  async set(key: string, value: any) {
    this.itemRegistry[key] = value;
  }

  async delete(key: string) {
    delete this.itemRegistry[key];
  }

  withOptions = () => this;
}

describe('createRouter', () => {
  let app: express.Express;
  const routerErrorLoggerMock = jest.fn((message: string) => message);

  beforeEach(async () => {
    jest.resetAllMocks();

    const router = await createRouter({
      reader: mockUrlReader,
      cacheClient: new MockCacheClient(),
      logger: {
        error: routerErrorLoggerMock as unknown,
      } as LoggerService,
    });
    app = express().use(router);
  });

  describe(`GET ${listEndpointName}`, () => {
    it('returns bad request (400) when no url is provided', async () => {
      const urlNotSpecifiedRequest = await request(app).get(listEndpointName);
      const urlNotSpecifiedStatus = urlNotSpecifiedRequest.status;
      const urlNotSpecifiedMessage = urlNotSpecifiedRequest.body.message;

      const urlNotFilledRequest = await request(app).get(
        `${listEndpointName}?url=`,
      );
      const urlNotFilledStatus = urlNotFilledRequest.status;
      const urlNotFilledMessage = urlNotFilledRequest.body.message;

      const expectedStatusCode = 400;
      const expectedErrorMessage = 'No URL provided';

      expect(urlNotSpecifiedStatus).toBe(expectedStatusCode);
      expect(urlNotSpecifiedMessage).toBe(expectedErrorMessage);

      expect(urlNotFilledStatus).toBe(expectedStatusCode);
      expect(urlNotFilledMessage).toBe(expectedErrorMessage);
    });

    it('returns the correct listing when reading a url', async () => {
      const result = await request(app).get(`${listEndpointName}?url=testing`);
      const { status, body, error } = result;

      const expectedStatusCode = 200;
      const expectedBody = {
        data: [
          {
            type: 'file',
            name: 'testFile002.txt',
            path: 'testFile002.txt',
          },
          {
            type: 'file',
            name: 'testFile001.txt',
            path: 'testFile001.txt',
          },
          {
            type: 'file',
            name: 'testFile001.txt',
            path: 'folder/testFile001.txt',
          },
        ],
      };

      expect(error).toBeFalsy();
      expect(status).toBe(expectedStatusCode);
      expect(body).toEqual(expectedBody);
      expect(routerErrorLoggerMock.mock.calls).toHaveLength(1);
      expect(routerErrorLoggerMock.mock.calls[0][0]).toBe(
        'Failed to parse .gitkeep: ADR has no content',
      );
    });
  });

  describe(`GET ${fileEndpointName}`, () => {
    it('returns bad request (400) when no url is provided', async () => {
      const urlNotSpecifiedRequest = await request(app).get(fileEndpointName);
      const urlNotSpecifiedStatus = urlNotSpecifiedRequest.status;
      const urlNotSpecifiedMessage = urlNotSpecifiedRequest.body.message;

      const urlNotFilledRequest = await request(app).get(
        `${fileEndpointName}?url=`,
      );
      const urlNotFilledStatus = urlNotFilledRequest.status;
      const urlNotFilledMessage = urlNotFilledRequest.body.message;

      const expectedStatusCode = 400;
      const expectedErrorMessage = 'No URL provided';

      expect(urlNotSpecifiedStatus).toBe(expectedStatusCode);
      expect(urlNotSpecifiedMessage).toBe(expectedErrorMessage);

      expect(urlNotFilledStatus).toBe(expectedStatusCode);
      expect(urlNotFilledMessage).toBe(expectedErrorMessage);
    });

    it('returns the correct file contents when reading a url', async () => {
      const fileOneResponse = await request(app).get(
        `${fileEndpointName}?url=testFileOne`,
      );
      const fileOneStatus = fileOneResponse.status;
      const fileOneBody = fileOneResponse.body;
      const fileOneError = fileOneResponse.error;

      const fileTwoResponse = await request(app).get(
        `${fileEndpointName}?url=testFileTwo`,
      );
      const fileTwoStatus = fileTwoResponse.status;
      const fileTwoBody = fileTwoResponse.body;
      const fileTwoError = fileTwoResponse.error;

      const expectedStatusCode = 200;

      expect(fileOneError).toBeFalsy();
      expect(fileOneStatus).toBe(expectedStatusCode);
      expect(fileOneBody.data).toBe(testFileOneContent);

      expect(fileTwoError).toBeFalsy();
      expect(fileTwoStatus).toBe(expectedStatusCode);
      expect(fileTwoBody.data).toBe(testFileTwoContent);
    });
  });

  describe(`GET ${imageEndpointName}`, () => {
    it('returns bad request (400) when no url is provided', async () => {
      const urlNotSpecifiedRequest = await request(app).get(imageEndpointName);
      const urlNotSpecifiedStatus = urlNotSpecifiedRequest.status;
      const urlNotSpecifiedMessage = urlNotSpecifiedRequest.body.message;

      const urlNotFilledRequest = await request(app).get(
        `${imageEndpointName}?url=`,
      );
      const urlNotFilledStatus = urlNotFilledRequest.status;
      const urlNotFilledMessage = urlNotFilledRequest.body.message;

      const expectedStatusCode = 400;
      const expectedErrorMessage = 'No URL provided';

      expect(urlNotSpecifiedStatus).toBe(expectedStatusCode);
      expect(urlNotSpecifiedMessage).toBe(expectedErrorMessage);

      expect(urlNotFilledStatus).toBe(expectedStatusCode);
      expect(urlNotFilledMessage).toBe(expectedErrorMessage);
    });

    it('returns bad request (400) when unsupported image format is provided', async () => {
      const urlNotFilledRequest = await request(app).get(
        `${imageEndpointName}?url=testImage.txt`,
      );
      const urlNotFilledStatus = urlNotFilledRequest.status;
      const urlNotFilledMessage = urlNotFilledRequest.body.message;

      const expectedStatusCode = 400;
      const expectedErrorMessage = 'Image type txt is not supported';

      expect(urlNotFilledStatus).toBe(expectedStatusCode);
      expect(urlNotFilledMessage).toBe(expectedErrorMessage);
    });

    it('returns the correct image when reading a url', async () => {
      const urlToProcess = 'testImage.png';
      const imageResponse = await request(app).get(
        `${imageEndpointName}?url=${urlToProcess}`,
      );
      const imageStatus = imageResponse.status;
      const imageData = imageResponse.body;
      const imageError = imageResponse.error;
      const responseBody = 'aW1hZ2UgY29udGVudA==';
      const expectedStatusCode = 200;

      expect(imageError).toBeFalsy();
      expect(imageStatus).toBe(expectedStatusCode);
      expect(imageData.toString('base64')).toBe(responseBody);
    });

    it('returns the image from cache', async () => {
      const urlToProcess = 'testImage.png';
      const cacheSpy = jest.spyOn(MockCacheClient.prototype, 'get');
      cacheSpy.mockImplementation(() => {
        return new Promise(resolve => {
          resolve({
            data: 'aW1hZ2UgY29udGVudA==',
            etag: 'd41d8cd98f00b204e9800998ecf8427e',
          });
        });
      });
      jest.spyOn(mockUrlReader, 'readUrl').mockImplementation(() => {
        throw new NotModifiedError();
      });

      const imageResponse = await request(app).get(
        `${imageEndpointName}?url=${urlToProcess}`,
      );
      const imageStatus = imageResponse.status;
      const imageData = imageResponse.body;
      const imageError = imageResponse.error;
      const responseBody = 'aW1hZ2UgY29udGVudA==';
      const expectedStatusCode = 200;

      expect(imageError).toBeFalsy();
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledWith(urlToProcess);
      expect(imageStatus).toBe(expectedStatusCode);
      expect(imageData.toString('base64')).toBe(responseBody);
    });
  });
});

let adrFilesFakeFileTree: UrlReaderServiceReadTreeResponseFile[] = [];

const mockMinimalAdrUrlReader: UrlReaderService = {
  readUrl() {
    throw new Error('Not implemented.');
  },
  readTree() {
    const result: UrlReaderServiceReadTreeResponse = {
      files: async () => adrFilesFakeFileTree,
      archive() {
        throw new Error('Not implemented.');
      },
      dir() {
        throw new Error('Not implemented.');
      },
      etag: '',
    };

    const resultPromise = async () => result;
    return resultPromise();
  },
  search() {
    throw new Error('not implemented.');
  },
};

describe('createRouter with parsing', () => {
  it('returns the list of ADRs with info computed by the default MADR parser', async () => {
    // given
    const adrTitle = 'MADR title';
    const adrStatus = 'accepted';
    const adrDate = '2025-03-26';
    const fileName = '001-adr-with-madr-format.md';
    const fileContent = `# ${adrTitle}\n\n* Status: ${adrStatus}\n* Date: ${adrDate}\n\n## Context and Problem Statement\n\nSome content\n\n## Considered Options\n\n* Some options\n\n## Decision Outcome\n\nSome decision`;
    adrFilesFakeFileTree = [
      {
        path: fileName,
        content: makeBufferFromString(fileContent),
      },
    ];
    const parser = undefined;
    const router = await createRouter({
      reader: mockMinimalAdrUrlReader,
      cacheClient: new MockCacheClient(),
      logger: jest.fn() as unknown as LoggerService,
      parser: parser,
    });
    const app: express.Express = express().use(router);

    // when
    const result = await request(app).get(`${listEndpointName}?url=testing`);
    const { status, body, error } = result;

    // then
    const expectedStatusCode = 200;
    const expectedBody = {
      data: [
        {
          type: 'file',
          name: fileName,
          path: fileName,
          title: adrTitle,
          status: adrStatus,
          date: adrDate,
        },
      ],
    };

    expect(error).toBeFalsy();
    expect(status).toBe(expectedStatusCode);
    expect(body).toEqual(expectedBody);
  });

  it('returns the list of ADRs with info computed by a custom parser', async () => {
    // given
    const adrTitle = 'Custom ADR title';
    const adrStatus = 'accepted';
    const adrDate = '2025-03-26';
    const fileName = '001-adr-with-custom-format.md';
    const fileContent = `Title: ${adrTitle}\nStatus: ${adrStatus}\nDate: ${adrDate}\n\nSome decision`;
    adrFilesFakeFileTree = [
      {
        path: fileName,
        content: makeBufferFromString(fileContent),
      },
    ];
    const parser: AdrInfoParser = (content: string) => {
      const lines = content.split('\n');
      return {
        title: lines[0].replace(/^Title: /, ''),
        status: lines[1].replace(/^Status: /, ''),
        date: lines[2].replace(/^Date: /, ''),
      };
    };
    const router = await createRouter({
      reader: mockMinimalAdrUrlReader,
      cacheClient: new MockCacheClient(),
      logger: jest.fn() as unknown as LoggerService,
      parser: parser,
    });
    const app: express.Express = express().use(router);

    // when
    const result = await request(app).get(`${listEndpointName}?url=testing`);
    const { status, body, error } = result;

    // then
    const expectedStatusCode = 200;
    const expectedBody = {
      data: [
        {
          type: 'file',
          name: fileName,
          path: fileName,
          title: adrTitle,
          status: adrStatus,
          date: adrDate,
        },
      ],
    };

    expect(error).toBeFalsy();
    expect(status).toBe(expectedStatusCode);
    expect(body).toEqual(expectedBody);
  });
});
