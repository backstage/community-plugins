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

import { fetchRepoFiles, findCommonFiles } from './fileOperations';
import { mockServices } from '@backstage/backend-test-utils';

describe('fileOperations', () => {
  describe('fetchRepoFiles', () => {
    it('should fetch and return files as a Map', async () => {
      const mockFile1 = {
        path: 'README.md',
        content: jest.fn().mockResolvedValue(Buffer.from('# README')),
      };

      const mockFile2 = {
        path: 'package.json',
        content: jest.fn().mockResolvedValue(Buffer.from('{"name": "test"}')),
      };

      const mockTree = {
        files: jest.fn().mockResolvedValue([mockFile1, mockFile2]),
      };

      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockResolvedValue(mockTree),
      });

      const result = await fetchRepoFiles(
        mockUrlReader,
        'https://github.com/org/repo',
      );

      expect(result.size).toBe(2);
      expect(result.get('README.md')).toBe('# README');
      expect(result.get('package.json')).toBe('{"name": "test"}');
    });

    it('should skip files that fail to read content', async () => {
      const mockFile1 = {
        path: 'README.md',
        content: jest.fn().mockResolvedValue(Buffer.from('# README')),
      };

      const mockFile2 = {
        path: 'corrupted.bin',
        content: jest.fn().mockRejectedValue(new Error('Read error')),
      };

      const mockFile3 = {
        path: 'package.json',
        content: jest.fn().mockResolvedValue(Buffer.from('{}')),
      };

      const mockTree = {
        files: jest.fn().mockResolvedValue([mockFile1, mockFile2, mockFile3]),
      };

      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockResolvedValue(mockTree),
      });

      const result = await fetchRepoFiles(
        mockUrlReader,
        'https://github.com/org/repo',
      );

      expect(result.size).toBe(2);
      expect(result.has('README.md')).toBe(true);
      expect(result.has('package.json')).toBe(true);
      expect(result.has('corrupted.bin')).toBe(false);
    });

    it('should return empty Map when tree has no files', async () => {
      const mockTree = {
        files: jest.fn().mockResolvedValue([]),
      };

      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockResolvedValue(mockTree),
      });

      const result = await fetchRepoFiles(
        mockUrlReader,
        'https://github.com/org/repo',
      );

      expect(result.size).toBe(0);
    });

    it('should throw error when readTree fails', async () => {
      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      await expect(
        fetchRepoFiles(mockUrlReader, 'https://github.com/org/repo'),
      ).rejects.toThrow('Error fetching repository files');
    });

    it('should throw error when files() method fails', async () => {
      const mockTree = {
        files: jest.fn().mockRejectedValue(new Error('Tree error')),
      };

      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockResolvedValue(mockTree),
      });

      await expect(
        fetchRepoFiles(mockUrlReader, 'https://github.com/org/repo'),
      ).rejects.toThrow('Error fetching repository files');
    });

    it('should handle files with UTF-8 content correctly', async () => {
      const mockFile = {
        path: 'unicode.txt',
        content: jest
          .fn()
          .mockResolvedValue(Buffer.from('Hello 世界 🌍', 'utf-8')),
      };

      const mockTree = {
        files: jest.fn().mockResolvedValue([mockFile]),
      };

      const mockUrlReader = mockServices.urlReader.mock({
        readTree: jest.fn().mockResolvedValue(mockTree),
      });

      const result = await fetchRepoFiles(
        mockUrlReader,
        'https://github.com/org/repo',
      );

      expect(result.get('unicode.txt')).toBe('Hello 世界 🌍');
    });
  });

  describe('findCommonFiles', () => {
    it('should find files that exist in both maps', () => {
      const templateFiles = new Map([
        ['README.md', 'template readme'],
        ['package.json', '{}'],
        ['src/index.ts', 'template code'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'scaffolded readme'],
        ['package.json', '{"name": "test"}'],
        ['src/custom.ts', 'custom code'],
      ]);

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['README.md', 'package.json']);
    });

    it('should return empty array when no common files exist', () => {
      const templateFiles = new Map([
        ['README.md', 'content'],
        ['template.txt', 'template'],
      ]);

      const scaffoldedFiles = new Map([
        ['custom.ts', 'custom'],
        ['local.env', 'env'],
      ]);

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should return empty array when template files is empty', () => {
      const templateFiles = new Map();

      const scaffoldedFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should return empty array when scaffolded files is empty', () => {
      const templateFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const scaffoldedFiles = new Map();

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should return empty array when both maps are empty', () => {
      const templateFiles = new Map();
      const scaffoldedFiles = new Map();

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should find all files when all template files exist in scaffolded', () => {
      const templateFiles = new Map([
        ['README.md', 'template'],
        ['package.json', '{}'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'scaffolded'],
        ['package.json', '{"name":"test"}'],
        ['extra.ts', 'extra'],
      ]);

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['README.md', 'package.json']);
    });

    it('should preserve the order from template files', () => {
      const templateFiles = new Map([
        ['z-file.txt', 'z'],
        ['a-file.txt', 'a'],
        ['m-file.txt', 'm'],
      ]);

      const scaffoldedFiles = new Map([
        ['m-file.txt', 'm'],
        ['z-file.txt', 'z'],
        ['a-file.txt', 'a'],
      ]);

      const result = findCommonFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['z-file.txt', 'a-file.txt', 'm-file.txt']);
    });
  });
});
