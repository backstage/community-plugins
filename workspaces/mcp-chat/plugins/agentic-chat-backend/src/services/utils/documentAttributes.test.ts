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
  generateTitleFromFileName,
  detectContentType,
  extractFileNameFromUrl,
  generateDefaultAttributes,
} from './documentAttributes';

describe('generateTitleFromFileName', () => {
  it('removes extension and converts separators to spaces', () => {
    expect(generateTitleFromFileName('my-file.ts')).toBe('my file');
    expect(generateTitleFromFileName('readme_markdown.md')).toBe(
      'readme markdown',
    );
  });

  it('handles various file extensions', () => {
    expect(generateTitleFromFileName('index.ts')).toBe('index');
    expect(generateTitleFromFileName('config.json')).toBe('config');
    expect(generateTitleFromFileName('script.py')).toBe('script');
    expect(generateTitleFromFileName('documentation.md')).toBe('documentation');
  });

  it('collapses multiple spaces', () => {
    expect(generateTitleFromFileName('my---file_name.ts')).toBe('my file name');
  });

  it('trims leading and trailing whitespace', () => {
    expect(generateTitleFromFileName('  foo_bar  .ts')).toBe('foo bar');
  });

  it('returns original filename when result would be empty', () => {
    expect(generateTitleFromFileName('.hidden')).toBe('.hidden');
  });

  it('handles empty string', () => {
    expect(generateTitleFromFileName('')).toBe('');
  });

  it('handles filename with no extension', () => {
    expect(generateTitleFromFileName('Makefile')).toBe('Makefile');
  });
});

describe('detectContentType', () => {
  it('detects markdown', () => {
    expect(detectContentType('readme.md')).toBe('markdown');
  });

  it('detects pdf', () => {
    expect(detectContentType('doc.pdf')).toBe('pdf-documentation');
  });

  it('detects text', () => {
    expect(detectContentType('notes.txt')).toBe('text');
  });

  it('detects yaml', () => {
    expect(detectContentType('config.yaml')).toBe('yaml');
    expect(detectContentType('config.yml')).toBe('yaml');
  });

  it('detects json', () => {
    expect(detectContentType('package.json')).toBe('json');
  });

  it('detects html', () => {
    expect(detectContentType('page.html')).toBe('html');
    expect(detectContentType('page.htm')).toBe('html');
  });

  it('returns text for unknown extensions', () => {
    expect(detectContentType('script.ts')).toBe('text');
    expect(detectContentType('script.py')).toBe('text');
    expect(detectContentType('file.xyz')).toBe('text');
  });

  it('handles no extension', () => {
    expect(detectContentType('Makefile')).toBe('text');
  });

  it('handles empty string', () => {
    expect(detectContentType('')).toBe('text');
  });

  it('is case insensitive', () => {
    expect(detectContentType('readme.MD')).toBe('markdown');
    expect(detectContentType('config.JSON')).toBe('json');
  });
});

describe('extractFileNameFromUrl', () => {
  it('extracts filename from simple URL', () => {
    expect(extractFileNameFromUrl('https://example.com/docs/readme.md')).toBe(
      'readme.md',
    );
  });

  it('extracts filename from URL with query params', () => {
    expect(
      extractFileNameFromUrl(
        'https://example.com/file.json?version=1&token=abc',
      ),
    ).toBe('file.json');
  });

  it('extracts filename from URL with hash', () => {
    expect(extractFileNameFromUrl('https://example.com/doc.pdf#page=5')).toBe(
      'doc.pdf',
    );
  });

  it('returns document.txt when pathname has no filename', () => {
    expect(extractFileNameFromUrl('https://example.com/')).toBe('document.txt');
  });

  it('returns document.txt for invalid URL', () => {
    expect(extractFileNameFromUrl('not-a-valid-url')).toBe('document.txt');
  });

  it('handles deep paths', () => {
    expect(
      extractFileNameFromUrl(
        'https://github.com/owner/repo/blob/main/src/index.ts',
      ),
    ).toBe('index.ts');
  });

  it('handles file extension in path', () => {
    expect(
      extractFileNameFromUrl('https://example.com/a/b/c/config.yaml'),
    ).toBe('config.yaml');
  });
});

describe('generateDefaultAttributes', () => {
  it('generates attributes from FetchedDocument', () => {
    const doc = {
      sourceId: 'https://example.com/readme.md',
      fileName: 'readme.md',
      content: '# Hello',
      sourceType: 'url' as const,
    };
    const attrs = generateDefaultAttributes(doc);
    expect(attrs.title).toBe('readme');
    expect(attrs.source_url).toBe('https://example.com/readme.md');
    expect(attrs.content_type).toBe('markdown');
  });

  it('uses sourceType when detected content type is text', () => {
    const doc = {
      sourceId: 'file:///local/path',
      fileName: 'notes.txt',
      content: 'notes',
      sourceType: 'directory' as const,
    };
    const attrs = generateDefaultAttributes(doc);
    expect(attrs.content_type).toBe('directory');
  });

  it('falls back to fileName when title would be empty', () => {
    const doc = {
      sourceId: 'https://example.com/',
      fileName: '.gitignore',
      content: '',
      sourceType: 'url' as const,
    };
    const attrs = generateDefaultAttributes(doc);
    expect(attrs.title).toBe('.gitignore');
  });
});
