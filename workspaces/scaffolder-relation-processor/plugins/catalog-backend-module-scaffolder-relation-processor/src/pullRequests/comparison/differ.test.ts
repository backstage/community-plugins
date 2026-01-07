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

import {
  compareFilesByHash,
  findTemplateOnlyFiles,
  findScaffoldedOnlyFiles,
  compareCommonFiles,
} from './differ';

describe('differ', () => {
  describe('compareFilesByHash', () => {
    it('should return true for identical content', () => {
      const content1 = 'name: my-component\ndescription: test';
      const content2 = 'name: my-component\ndescription: test';

      const result = compareFilesByHash(content1, content2);

      expect(result).toBe(true);
    });

    it('should return false for different content', () => {
      const content1 = 'name: my-component\ndescription: test';
      const content2 = 'name: other-component\ndescription: test';

      const result = compareFilesByHash(content1, content2);

      expect(result).toBe(false);
    });

    it('should return true for empty strings', () => {
      const result = compareFilesByHash('', '');

      expect(result).toBe(true);
    });

    it('should return false when comparing empty with non-empty', () => {
      const result = compareFilesByHash('', 'some content');

      expect(result).toBe(false);
    });
  });

  describe('findTemplateOnlyFiles', () => {
    it('should find files that exist only in template', () => {
      const templateFiles = new Map([
        ['README.md', 'template readme'],
        ['package.json', '{}'],
        ['newFile.ts', 'new code'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'scaffolded readme'],
        ['package.json', '{}'],
      ]);

      const result = findTemplateOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['newFile.ts']);
    });

    it('should return empty array when all template files exist in scaffolded', () => {
      const templateFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
        ['extra.ts', 'extra'],
      ]);

      const result = findTemplateOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should return all files when scaffolded is empty', () => {
      const templateFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const scaffoldedFiles = new Map();

      const result = findTemplateOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['README.md', 'package.json']);
    });
  });

  describe('findScaffoldedOnlyFiles', () => {
    it('should find files that exist only in scaffolded repo', () => {
      const templateFiles = new Map([
        ['README.md', 'template readme'],
        ['package.json', '{}'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'scaffolded readme'],
        ['package.json', '{}'],
        ['custom.ts', 'custom code'],
        ['local.env', 'env vars'],
      ]);

      const result = findScaffoldedOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['custom.ts', 'local.env']);
    });

    it('should return empty array when all scaffolded files exist in template', () => {
      const templateFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
        ['extra.ts', 'extra'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const result = findScaffoldedOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual([]);
    });

    it('should return all files when template is empty', () => {
      const templateFiles = new Map();

      const scaffoldedFiles = new Map([
        ['README.md', 'content'],
        ['package.json', '{}'],
      ]);

      const result = findScaffoldedOnlyFiles(templateFiles, scaffoldedFiles);

      expect(result).toEqual(['README.md', 'package.json']);
    });
  });

  describe('compareCommonFiles', () => {
    it('should return files that have different content', () => {
      const commonFiles = ['README.md', 'package.json'];

      const templateFiles = new Map([
        ['README.md', 'name: ${{ values.name }}'],
        ['package.json', '{"version": "1.0.0"}'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'name: my-component'],
        ['package.json', '{"version": "2.0.0"}'],
      ]);

      const result = compareCommonFiles(
        commonFiles,
        templateFiles,
        scaffoldedFiles,
      );

      expect(result.has('package.json')).toBe(true);
      expect(result.get('package.json')).toBe('{"version": "1.0.0"}');
    });

    it('should not return files that are identical after preprocessing', () => {
      const commonFiles = ['README.md'];

      const templateFiles = new Map([
        ['README.md', 'name: ${{ values.name }}\ndescription: test'],
      ]);

      const scaffoldedFiles = new Map([
        ['README.md', 'name: my-component\ndescription: test'],
      ]);

      const result = compareCommonFiles(
        commonFiles,
        templateFiles,
        scaffoldedFiles,
      );

      expect(result.size).toBe(0);
    });

    it('should return empty map when no common files provided', () => {
      const commonFiles: string[] = [];

      const templateFiles = new Map([['README.md', 'content']]);
      const scaffoldedFiles = new Map([['README.md', 'content']]);

      const result = compareCommonFiles(
        commonFiles,
        templateFiles,
        scaffoldedFiles,
      );

      expect(result.size).toBe(0);
    });

    it('should skip files that do not exist in both maps', () => {
      const commonFiles = ['README.md', 'missing.txt'];

      const templateFiles = new Map([['README.md', 'template']]);
      const scaffoldedFiles = new Map([['README.md', 'scaffolded']]);

      const result = compareCommonFiles(
        commonFiles,
        templateFiles,
        scaffoldedFiles,
      );

      expect(result.has('missing.txt')).toBe(false);
    });

    it('should return preprocessed template content for updated files', () => {
      const commonFiles = ['catalog-info.yaml'];

      const templateFiles = new Map([
        [
          'catalog-info.yaml',
          'apiVersion: v1\nkind: Component\nmetadata:\n  name: ${{ values.name }}',
        ],
      ]);

      const scaffoldedFiles = new Map([
        [
          'catalog-info.yaml',
          'apiVersion: v1\nkind: Component\nmetadata:\n  name: my-component',
        ],
      ]);

      const result = compareCommonFiles(
        commonFiles,
        templateFiles,
        scaffoldedFiles,
      );

      // File should match after preprocessing, so no update needed
      expect(result.size).toBe(0);
    });
  });
});
