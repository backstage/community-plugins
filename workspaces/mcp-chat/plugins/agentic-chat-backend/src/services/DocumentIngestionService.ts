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
import {
  DocumentSource,
  DirectorySource,
  UrlSource,
  GitHubSource,
  FetchedDocument,
  FileAttributes,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fetchWithTlsControl } from './utils/http';
import { isPrivateUrl } from './utils/SsrfGuard';
import {
  generateTitleFromFileName,
  detectContentType,
  extractFileNameFromUrl,
} from './utils/documentAttributes';
import { matchesPatterns } from './utils/GlobMatcher';
import { toErrorMessage } from './utils';

const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

/**
 * Service for fetching documents from various sources
 * @internal
 */
export class DocumentIngestionService {
  private readonly logger: LoggerService;
  private readonly skipTlsVerify: boolean;

  constructor(options: { logger: LoggerService; skipTlsVerify?: boolean }) {
    this.logger = options.logger;
    this.skipTlsVerify = options.skipTlsVerify ?? false;
  }

  private fetchUrl(url: string, headers: Record<string, string> = {}) {
    return fetchWithTlsControl(url, {
      headers,
      skipTlsVerify: this.skipTlsVerify,
    });
  }

  /**
   * Compute a SHA-256 hash of content for change detection.
   * Uses first 16 chars of hex digest for reasonable collision resistance.
   */
  private computeContentHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content, 'utf8')
      .digest('hex')
      .substring(0, 16);
  }

  /** Build a {@link FileAttributes} object for a document. */
  private buildAttributes(
    fileName: string,
    sourceUrl: string,
    modulePath?: string,
  ): FileAttributes {
    return {
      title: generateTitleFromFileName(fileName),
      source_url: sourceUrl,
      content_type: detectContentType(fileName),
      ...(modulePath ? { module: modulePath } : {}),
    };
  }

  /**
   * Fetch all documents from configured sources.
   */
  async fetchFromSources(
    sources: DocumentSource[],
  ): Promise<FetchedDocument[]> {
    const allDocuments: FetchedDocument[] = [];

    for (const source of sources) {
      try {
        let documents: FetchedDocument[] = [];

        switch (source.type) {
          case 'directory':
            documents = await this.fetchFromDirectory(source);
            break;
          case 'url':
            documents = await this.fetchFromUrls(source);
            break;
          case 'github':
            documents = await this.fetchFromGitHub(source);
            break;
          default: {
            const unhandledSource: never = source;
            this.logger.warn(
              `Unknown source type: ${
                (unhandledSource as DocumentSource).type
              }`,
            );
          }
        }

        this.logger.info(
          `Fetched ${documents.length} documents from ${source.type} source`,
        );
        allDocuments.push(...documents);
      } catch (error) {
        this.logger.error(
          `Failed to fetch from ${source.type} source: ${toErrorMessage(
            error,
          )}`,
        );
      }
    }

    return allDocuments;
  }

  private async fetchFromDirectory(
    source: DirectorySource,
  ): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];
    const patterns = source.patterns || [
      '**/*.md',
      '**/*.txt',
      '**/*.yaml',
      '**/*.json',
    ];

    const cwd = process.cwd();
    const basePath = path.isAbsolute(source.path)
      ? source.path
      : path.resolve(cwd, source.path);

    if (!path.isAbsolute(source.path)) {
      const normalizedBase = path.normalize(basePath);
      if (
        !normalizedBase.startsWith(cwd + path.sep) &&
        normalizedBase !== cwd
      ) {
        this.logger.warn(
          `Directory source path "${source.path}" resolves outside the working directory — skipping`,
        );
        return documents;
      }
    }

    this.logger.info(`Scanning directory: ${basePath}`);

    if (!fs.existsSync(basePath)) {
      this.logger.warn(`Directory does not exist: ${basePath}`);
      return documents;
    }

    const files = await this.findFiles(basePath, patterns);

    for (const filePath of files) {
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const relativePath = path.relative(basePath, filePath);
        const fileName = path.basename(filePath);

        documents.push({
          sourceId: `directory:${source.path}:${relativePath}`,
          fileName,
          content,
          sourceType: 'directory',
          contentHash: this.computeContentHash(content),
          attributes: this.buildAttributes(
            fileName,
            `file://${filePath}`,
            path.dirname(relativePath) || 'root',
          ),
        });
      } catch (error) {
        this.logger.warn(
          `Failed to read file ${filePath}: ${toErrorMessage(error)}`,
        );
      }
    }

    return documents;
  }

  private async fetchFromUrls(source: UrlSource): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];

    for (const url of source.urls) {
      try {
        const blockedReason = isPrivateUrl(url);
        if (blockedReason) {
          this.logger.warn(
            `Skipping URL ${url}: blocked by SSRF protection (${blockedReason})`,
          );
          continue;
        }

        this.logger.debug(`Fetching URL: ${url}`);

        const response = await this.fetchUrl(url, source.headers || {});
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        const fileName = extractFileNameFromUrl(url);

        documents.push({
          sourceId: `url:${url}`,
          fileName,
          content,
          sourceType: 'url',
          contentHash: this.computeContentHash(content),
          attributes: this.buildAttributes(fileName, url),
        });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch URL ${url}: ${toErrorMessage(error)}`,
        );
      }
    }

    return documents;
  }

  private async fetchFromGitHub(
    source: GitHubSource,
  ): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];
    const branch = source.branch || 'main';
    const repoPath = source.path || '';
    const patterns = source.patterns || [
      '**/*.md',
      '**/*.txt',
      '**/*.yaml',
      '**/*.json',
    ];

    try {
      if (!GITHUB_REPO_PATTERN.test(source.repo)) {
        throw new Error(
          `Invalid GitHub repo format "${source.repo}". Expected "owner/repo".`,
        );
      }

      const apiUrl = `https://api.github.com/repos/${source.repo}/git/trees/${branch}?recursive=1`;

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'agentic-chat-backstage-plugin',
      };

      if (source.token) {
        headers.Authorization = `Bearer ${source.token}`;
      }

      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(30_000),
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        tree: Array<{ path: string; type: string; url: string }>;
      };

      const files = data.tree.filter(item => {
        if (item.type !== 'blob') return false;
        if (repoPath && !item.path.startsWith(repoPath)) return false;
        return matchesPatterns(item.path, patterns);
      });

      this.logger.info(
        `Found ${files.length} matching files in ${source.repo}`,
      );

      for (const file of files) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${source.repo}/${branch}/${file.path}`;

          const fileResponse = await fetch(rawUrl, {
            signal: AbortSignal.timeout(30_000),
            headers: source.token
              ? { Authorization: `Bearer ${source.token}` }
              : {},
          });

          if (!fileResponse.ok) {
            throw new Error(`HTTP ${fileResponse.status}`);
          }

          const content = await fileResponse.text();
          const fileName = path.basename(file.path);
          const githubHtmlUrl = `https://github.com/${source.repo}/blob/${branch}/${file.path}`;

          documents.push({
            sourceId: `github:${source.repo}:${file.path}`,
            fileName,
            content,
            sourceType: 'github',
            contentHash: this.computeContentHash(content),
            attributes: this.buildAttributes(
              fileName,
              githubHtmlUrl,
              path.dirname(file.path) || source.repo,
            ),
          });
        } catch (error) {
          this.logger.warn(
            `Failed to fetch ${file.path} from GitHub: ${toErrorMessage(
              error,
            )}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to list files from GitHub repo ${source.repo}: ${toErrorMessage(
          error,
        )}`,
      );
    }

    return documents;
  }

  private async findFiles(
    basePath: string,
    patterns: string[],
  ): Promise<string[]> {
    const files: string[] = [];
    const normalizedBase = await fs.promises.realpath(basePath);

    const walkDir = async (dir: string): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        let realFullPath: string;
        try {
          realFullPath = await fs.promises.realpath(fullPath);
        } catch {
          this.logger.debug('realpath resolution failed, using original path');
          continue;
        }
        if (
          !realFullPath.startsWith(normalizedBase + path.sep) &&
          realFullPath !== normalizedBase
        ) {
          this.logger.debug(
            `Skipping "${entry.name}": resolves outside base directory`,
          );
          continue;
        }

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          const relativePath = path.relative(basePath, fullPath);
          if (matchesPatterns(relativePath, patterns)) {
            files.push(fullPath);
          }
        }
      }
    };

    await walkDir(basePath);
    return files;
  }
}
