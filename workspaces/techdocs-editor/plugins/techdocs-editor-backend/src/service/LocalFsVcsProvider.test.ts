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

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LocalFsVcsProvider } from './LocalFsVcsProvider';

describe('LocalFsVcsProvider', () => {
  let tmpDir: string;
  let provider: LocalFsVcsProvider;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'techdocs-editor-'));
    provider = new LocalFsVcsProvider();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('listFiles', () => {
    it('does not descend into node_modules even when it is inside the docs directory', async () => {
      await fs.writeFile(path.join(tmpDir, 'index.md'), '# Home');
      const scopedPkgDir = path.join(
        tmpDir,
        'node_modules',
        '@apidevtools',
        'json-schema-ref-parser',
      );
      await fs.mkdir(scopedPkgDir, { recursive: true });
      await fs.writeFile(
        path.join(scopedPkgDir, 'CHANGELOG.md'),
        '# Changelog',
      );

      const files = await provider.listFiles({
        repoUrl: `file://${tmpDir}`,
        ref: 'local',
        dirPath: '.',
      });

      expect(files).toEqual(['index.md']);
    });

    it('returns an empty list when the directory does not exist', async () => {
      const files = await provider.listFiles({
        repoUrl: `file://${tmpDir}`,
        ref: 'local',
        dirPath: 'missing',
      });

      expect(files).toEqual([]);
    });

    describe('readFile', () => {
      it('returns image files as base64 payloads', async () => {
        const pngBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        await fs.writeFile(path.join(tmpDir, 'logo.png'), pngBytes);

        const file = await provider.readFile({
          repoUrl: `file://${tmpDir}`,
          ref: 'local',
          filePath: 'logo.png',
        });

        expect(file.encoding).toBe('base64');
        expect(file.mimeType).toBe('image/png');
        expect(file.content).toBe(pngBytes.toString('base64'));
      });
    });
  });
});
