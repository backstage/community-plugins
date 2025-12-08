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

import { ConfigReader } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ConfluencePreparer } from './ConfluencePreparer';

const mockLogger: LoggerService = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

describe('ConfluencePreparer', () => {
  describe('isConfluenceUrl', () => {
    it('should return true for Confluence Cloud URLs with /spaces/ path', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl(
          'https://company.atlassian.net/wiki/spaces/DOCS/pages/123456/Title',
        ),
      ).toBe(true);
    });

    it('should return true for Confluence Server URLs with /display/ path', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl(
          'https://confluence.example.com/display/SPACE/Page+Title',
        ),
      ).toBe(true);
    });

    it('should return true for URLs with /pages/viewpage.action', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl(
          'https://confluence.example.com/pages/viewpage.action?pageId=123456',
        ),
      ).toBe(true);
    });

    it('should return true for URLs with confluence in hostname', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl(
          'https://confluence.mycompany.com/some/path',
        ),
      ).toBe(true);
    });

    it('should return true for Atlassian Cloud URLs', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl(
          'https://myorg.atlassian.net/wiki/some/path',
        ),
      ).toBe(true);
    });

    it('should return false for non-Confluence URLs', () => {
      expect(
        ConfluencePreparer.isConfluenceUrl('https://github.com/backstage/repo'),
      ).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(ConfluencePreparer.isConfluenceUrl('not-a-url')).toBe(false);
    });
  });

  describe('fromConfig', () => {
    it('should throw error when confluence config is missing', () => {
      const config = new ConfigReader({});
      const logger = mockLogger;

      expect(() => ConfluencePreparer.fromConfig({ logger, config })).toThrow(
        'Confluence configuration is missing',
      );
    });

    it('should create preparer with bearer auth config', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should create preparer with basic auth config', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            type: 'basic',
            token: 'test-token',
            email: 'user@example.com',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should create preparer with userpass auth config', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://confluence.example.com',
          auth: {
            type: 'userpass',
            username: 'user',
            password: 'pass',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should default auth type to bearer when not specified', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            token: 'test-token',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should remove trailing slash from baseUrl', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki/',
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should read pageTree config with defaults', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });

    it('should read custom pageTree config', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
          pageTree: {
            parallel: false,
            maxDepth: 5,
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer).toBeInstanceOf(ConfluencePreparer);
    });
  });

  describe('shouldCleanPreparedDirectory', () => {
    it('should return true', () => {
      const config = new ConfigReader({
        confluence: {
          baseUrl: 'https://company.atlassian.net/wiki',
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
        },
      });
      const logger = mockLogger;

      const preparer = ConfluencePreparer.fromConfig({ logger, config });
      expect(preparer.shouldCleanPreparedDirectory()).toBe(true);
    });
  });
});
