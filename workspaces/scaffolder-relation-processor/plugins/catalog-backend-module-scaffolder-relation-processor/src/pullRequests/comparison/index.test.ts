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

import { fetchAndCompareFiles } from './index';
import type { UrlReaderService } from '@backstage/backend-plugin-api';

// Mock the fileOperations module
jest.mock('../vcs/utils/fileOperations', () => ({
  fetchRepoFiles: jest.fn(),
  findCommonFiles: jest.fn(),
}));

// Mock the differ module
jest.mock('./differ', () => ({
  compareCommonFiles: jest.fn(),
  findTemplateOnlyFiles: jest.fn(),
  findScaffoldedOnlyFiles: jest.fn(),
}));

import { fetchRepoFiles, findCommonFiles } from '../vcs/utils/fileOperations';
import {
  compareCommonFiles,
  findTemplateOnlyFiles,
  findScaffoldedOnlyFiles,
} from './differ';

describe('fetchAndCompareFiles', () => {
  const mockUrlReader = {} as UrlReaderService;
  const scaffoldedUrl = 'https://github.com/org/scaffolded-repo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return files that need updating, adding, and deleting', async () => {
    const templateFiles = new Map([
      ['README.md', 'template readme'],
      ['package.json', '{"name": "template"}'],
      ['newFile.ts', 'new content'],
    ]);

    const scaffoldedFiles = new Map([
      ['README.md', 'scaffolded readme'],
      ['package.json', '{"name": "scaffolded"}'],
      ['oldFile.ts', 'old content'],
    ]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue([
      'README.md',
      'package.json',
    ]);
    (compareCommonFiles as jest.Mock).mockReturnValue(
      new Map([
        ['README.md', 'updated readme'],
        ['package.json', '{"name": "updated"}'],
      ]),
    );
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue(['newFile.ts']);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue(['oldFile.ts']);

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result).not.toBeNull();
    expect(result?.size).toBe(4);
    expect(result?.get('README.md')).toBe('updated readme');
    expect(result?.get('package.json')).toBe('{"name": "updated"}');
    expect(result?.get('newFile.ts')).toBe('new content');
    expect(result?.get('oldFile.ts')).toBeNull(); // Marked for deletion
  });

  it('should return empty map when no differences found', async () => {
    const templateFiles = new Map([['README.md', 'content']]);
    const scaffoldedFiles = new Map([['README.md', 'content']]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue(['README.md']);
    (compareCommonFiles as jest.Mock).mockReturnValue(new Map());
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue([]);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue([]);

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result).not.toBeNull();
    expect(result?.size).toBe(0);
  });

  it('should handle template-only files correctly', async () => {
    const templateFiles = new Map([
      ['README.md', 'content'],
      ['newFile1.ts', 'content1'],
      ['newFile2.ts', 'content2'],
    ]);

    const scaffoldedFiles = new Map([['README.md', 'content']]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue(['README.md']);
    (compareCommonFiles as jest.Mock).mockReturnValue(new Map());
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue([
      'newFile1.ts',
      'newFile2.ts',
    ]);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue([]);

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result?.size).toBe(2);
    expect(result?.get('newFile1.ts')).toBe('content1');
    expect(result?.get('newFile2.ts')).toBe('content2');
  });

  it('should handle scaffolded-only files correctly (mark for deletion)', async () => {
    const templateFiles = new Map([['README.md', 'content']]);

    const scaffoldedFiles = new Map([
      ['README.md', 'content'],
      ['oldFile1.ts', 'old1'],
      ['oldFile2.ts', 'old2'],
    ]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue(['README.md']);
    (compareCommonFiles as jest.Mock).mockReturnValue(new Map());
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue([]);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue([
      'oldFile1.ts',
      'oldFile2.ts',
    ]);

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result?.size).toBe(2);
    expect(result?.get('oldFile1.ts')).toBeNull();
    expect(result?.get('oldFile2.ts')).toBeNull();
  });

  it('should return null when fetchRepoFiles throws an error', async () => {
    const templateFiles = new Map([['README.md', 'content']]);

    (fetchRepoFiles as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch'),
    );

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result).toBeNull();
  });

  it('should not add template-only files with non-string content', async () => {
    const templateFiles = new Map([
      ['README.md', 'content'],
      ['invalid.ts', undefined as any],
    ]);

    const scaffoldedFiles = new Map([['README.md', 'content']]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue(['README.md']);
    (compareCommonFiles as jest.Mock).mockReturnValue(new Map());
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue(['invalid.ts']);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue([]);

    const result = await fetchAndCompareFiles(
      mockUrlReader,
      scaffoldedUrl,
      templateFiles,
    );

    expect(result?.has('invalid.ts')).toBe(false);
  });

  it('should call all helper functions with correct arguments', async () => {
    const templateFiles = new Map([['README.md', 'template']]);
    const scaffoldedFiles = new Map([['README.md', 'scaffolded']]);

    (fetchRepoFiles as jest.Mock).mockResolvedValue(scaffoldedFiles);
    (findCommonFiles as jest.Mock).mockReturnValue(['README.md']);
    (compareCommonFiles as jest.Mock).mockReturnValue(new Map());
    (findTemplateOnlyFiles as jest.Mock).mockReturnValue([]);
    (findScaffoldedOnlyFiles as jest.Mock).mockReturnValue([]);

    await fetchAndCompareFiles(mockUrlReader, scaffoldedUrl, templateFiles);

    expect(fetchRepoFiles).toHaveBeenCalledWith(mockUrlReader, scaffoldedUrl);
    expect(findCommonFiles).toHaveBeenCalledWith(
      templateFiles,
      scaffoldedFiles,
    );
    expect(compareCommonFiles).toHaveBeenCalledWith(
      ['README.md'],
      templateFiles,
      scaffoldedFiles,
    );
    expect(findTemplateOnlyFiles).toHaveBeenCalledWith(
      templateFiles,
      scaffoldedFiles,
    );
    expect(findScaffoldedOnlyFiles).toHaveBeenCalledWith(
      templateFiles,
      scaffoldedFiles,
    );
  });
});
