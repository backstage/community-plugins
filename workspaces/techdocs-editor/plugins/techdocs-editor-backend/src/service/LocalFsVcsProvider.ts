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
import path from 'node:path';
import crypto from 'node:crypto';
import {
  VcsProvider,
  OpenPrOptions,
  OpenPrResult,
  VcsFileResult,
} from '@backstage-community/plugin-techdocs-editor-node';
import { NotFoundError, InputError } from '@backstage/errors';

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function getImageMimeType(filePath: string): string | undefined {
  return IMAGE_MIME_TYPES[path.extname(filePath).toLocaleLowerCase('en-US')];
}

/**
 * VcsProvider implementation for local filesystem documentation.
 * Handles file:// URLs and writes changes directly to disk.
 *
 * @internal
 */
export class LocalFsVcsProvider implements VcsProvider {
  readonly id = 'local-fs';

  canHandle(repoUrl: string): boolean {
    return repoUrl.startsWith('file://');
  }

  async getDefaultBranch(_repoUrl: string): Promise<string> {
    // Local files have no branch concept; return sentinel value
    return 'local';
  }

  async readFile(opts: {
    repoUrl: string;
    ref: string;
    filePath: string;
  }): Promise<VcsFileResult> {
    const basePath = this.urlToPath(opts.repoUrl);
    const fullPath = path.join(basePath, opts.filePath);

    // Security check: ensure path doesn't escape basePath
    this.assertWithinBase(fullPath, basePath);

    try {
      const mimeType = getImageMimeType(opts.filePath);
      const bytes = await fs.readFile(fullPath);
      const stat = await fs.stat(fullPath);
      // Use mtime + size as etag for conflict detection
      const etag = crypto
        .createHash('sha256')
        .update(`${stat.mtimeMs}-${stat.size}`)
        .digest('hex')
        .slice(0, 16);
      if (mimeType) {
        return {
          content: bytes.toString('base64'),
          encoding: 'base64',
          mimeType,
          etag,
        };
      }
      return { content: bytes.toString('utf-8'), encoding: 'utf8', etag };
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'ENOENT'
      ) {
        throw new NotFoundError(`File not found: ${opts.filePath}`);
      }
      throw err;
    }
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    const basePath = this.urlToPath(opts.repoUrl);
    const fullDir = path.join(basePath, opts.dirPath);

    // Security check: ensure dir doesn't escape basePath
    this.assertWithinBase(fullDir, basePath);

    const files: string[] = [];
    try {
      await this.walkDir(fullDir, '', files);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'ENOENT'
      ) {
        // Directory doesn't exist — return empty list
        return [];
      }
      throw err;
    }
    return files.sort();
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    const basePath = this.urlToPath(opts.repoUrl);

    // Write each file directly to disk
    let savedCount = 0;
    for (const [filePath, file] of opts.files) {
      const fullPath = path.join(basePath, filePath);

      // Security check: ensure path doesn't escape basePath
      this.assertWithinBase(fullPath, basePath);

      if (file === null) {
        // Delete file — ignore if it doesn't exist
        await fs.unlink(fullPath).catch(() => {});
      } else {
        // Ensure parent directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        const encoding = file.encoding ?? 'utf8';
        if (encoding === 'base64') {
          await fs.writeFile(fullPath, Buffer.from(file.content, 'base64'));
        } else {
          await fs.writeFile(fullPath, file.content, 'utf-8');
        }
      }
      savedCount++;
    }

    // Return synthetic result — no actual PR
    return {
      url: '', // Frontend will check savedLocally flag instead
      number: savedCount, // Repurpose for count (router overrides this)
    };
  }

  /**
   * Convert a file:// URL to a local filesystem path.
   * Handles both file:///path and file://path formats.
   */
  private urlToPath(fileUrl: string): string {
    // file:///path/to/docs → /path/to/docs
    // On Windows: file:///C:/path → C:/path
    return decodeURIComponent(fileUrl.replace(/^file:\/\//, ''));
  }

  /**
   * Ensure a target path is within (or equal to) the base path.
   * Throws InputError if path traversal is detected.
   */
  private assertWithinBase(targetPath: string, basePath: string): void {
    const resolved = path.resolve(targetPath);
    const resolvedBase = path.resolve(basePath);
    if (
      !resolved.startsWith(resolvedBase + path.sep) &&
      resolved !== resolvedBase
    ) {
      throw new InputError(
        `Path '${targetPath}' is outside the allowed base path.`,
      );
    }
  }

  /**
   * Recursively walk a directory and collect markdown file paths.
   * @param dirPath - Absolute path to the directory
   * @param relativePath - Path relative to the docs root (for output)
   * @param files - Output array to accumulate file paths
   */
  private async walkDir(
    dirPath: string,
    relativePath: string,
    files: string[],
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      // Skip hidden files/directories and dependency/build trees that should
      // never be treated as documentation content (e.g. node_modules can
      // contain scoped-package folders like `@apidevtools` with their own
      // markdown files, which are not part of the docs source).
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const relPath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await this.walkDir(fullPath, relPath, files);
      } else if (entry.isFile()) {
        // Include markdown files and common doc assets
        const ext = path.extname(entry.name).toLocaleLowerCase('en-US');
        if (
          ['.md', '.mdx', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)
        ) {
          files.push(relPath);
        }
      }
    }
  }
}
