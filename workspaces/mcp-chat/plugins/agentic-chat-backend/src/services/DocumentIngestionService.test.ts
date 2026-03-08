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
import { DocumentIngestionService } from './DocumentIngestionService';

function createMockLogger(): Record<string, jest.Mock> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

describe('DocumentIngestionService', () => {
  let mockLogger: Record<string, jest.Mock>;

  beforeEach(() => {
    mockLogger = createMockLogger();
  });

  it('creates an instance', () => {
    const service = new DocumentIngestionService({
      logger: mockLogger as unknown as LoggerService,
    });
    expect(service).toBeDefined();
  });

  describe('fetchFromSources — SSRF protection', () => {
    it('blocks localhost URL sources', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'url', urls: ['http://localhost/secret'] },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });

    it('blocks 127.0.0.1 URL sources', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'url', urls: ['http://127.0.0.1:8080/admin'] },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });

    it('blocks cloud metadata endpoint (169.254.169.254)', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'url', urls: ['http://169.254.169.254/latest/meta-data/'] },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });

    it('blocks private network IPs (10.x)', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'url', urls: ['http://10.0.0.1/internal-api'] },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });

    it('blocks private network IPs (192.168.x)', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'url', urls: ['http://192.168.1.1/config'] },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });

    it('blocks Google metadata hostname', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        {
          type: 'url',
          urls: ['http://metadata.google.internal/computeMetadata/v1/'],
        },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('blocked by SSRF protection'),
      );
    });
  });

  describe('fetchFromSources — path traversal protection', () => {
    it('blocks directory sources that traverse outside cwd', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'directory', path: '../../../etc' },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('resolves outside the working directory'),
      );
    });
  });

  describe('fetchFromSources — empty input', () => {
    it('returns empty array for no sources', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([]);
      expect(docs).toHaveLength(0);
    });
  });

  describe('fetchFromSources — non-existent directory', () => {
    it('warns and returns empty for non-existent directory', async () => {
      const service = new DocumentIngestionService({
        logger: mockLogger as unknown as LoggerService,
      });
      const docs = await service.fetchFromSources([
        { type: 'directory', path: '/nonexistent-path-abc123' },
      ]);
      expect(docs).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('does not exist'),
      );
    });
  });
});
