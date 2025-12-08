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

import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { InputError, NotFoundError } from '@backstage/errors';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  PreparerBase,
  PreparerResponse,
  PreparerOptions,
} from '@backstage/plugin-techdocs-node';
import { TECHDOCS_ANNOTATION } from '@backstage/plugin-techdocs-common';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import YAML from 'yaml';

interface ConfluenceConfig {
  baseUrl: string;
  authType: 'bearer' | 'basic' | 'userpass';
  token?: string;
  email?: string;
  username?: string;
  password?: string;
  pageTree: {
    parallel: boolean;
    maxDepth: number;
  };
}

interface ConfluencePage {
  id: string;
  title: string;
  body: {
    export_view: {
      value: string;
    };
  };
}

interface ConfluencePageWithChildren extends ConfluencePage {
  children?: {
    page?: {
      results: ConfluencePageSummary[];
    };
  };
}

interface ConfluencePageSummary {
  id: string;
  title: string;
  _links?: {
    self?: string;
  };
}

interface ConfluenceAttachment {
  id: string;
  title: string;
  _links: {
    download: string;
  };
  version?: {
    number: number;
  };
  mediaType?: string;
  metadata?: {
    mediaType?: string;
  };
  extensions?: {
    mediaType?: string;
  };
}

/**
 * Preparer for fetching documentation from Confluence and converting to Markdown
 * @public
 */
export class ConfluencePreparer implements PreparerBase {
  private readonly logger: LoggerService;
  private readonly config: ConfluenceConfig;

  constructor(logger: LoggerService, config: Config) {
    this.logger = logger;

    const confluenceConfig = config.getOptionalConfig('confluence');
    if (!confluenceConfig) {
      throw new Error(
        'Confluence configuration is missing. Please add confluence section to app-config.yaml',
      );
    }

    const authType =
      (confluenceConfig.getOptionalString('auth.type') as
        | 'bearer'
        | 'basic'
        | 'userpass') || 'bearer';

    this.config = {
      baseUrl: confluenceConfig.getString('baseUrl'),
      authType,
      token: confluenceConfig.getOptionalString('auth.token'),
      email: confluenceConfig.getOptionalString('auth.email'),
      username: confluenceConfig.getOptionalString('auth.username'),
      password: confluenceConfig.getOptionalString('auth.password'),
      pageTree: {
        parallel:
          confluenceConfig.getOptionalBoolean('pageTree.parallel') ?? true,
        maxDepth: confluenceConfig.getOptionalNumber('pageTree.maxDepth') ?? 0,
      },
    };

    // Ensure baseUrl doesn't end with a slash
    this.config.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  /**
   * Get the Authorization header value based on auth type
   */
  private getAuthorizationHeader(): string | undefined {
    switch (this.config.authType) {
      case 'bearer':
        if (this.config.token) {
          return `Bearer ${this.config.token}`;
        }
        break;
      case 'basic':
        if (this.config.email && this.config.token) {
          const auth = Buffer.from(
            `${this.config.email}:${this.config.token}`,
          ).toString('base64');
          return `Basic ${auth}`;
        }
        break;
      case 'userpass':
        if (this.config.username && this.config.password) {
          const auth = Buffer.from(
            `${this.config.username}:${this.config.password}`,
          ).toString('base64');
          return `Basic ${auth}`;
        }
        break;
      default:
        break;
    }
    return undefined;
  }

  /**
   * Factory method to create a ConfluencePreparer
   */
  static fromConfig(options: {
    logger: LoggerService;
    config: Config;
  }): ConfluencePreparer {
    return new ConfluencePreparer(options.logger, options.config);
  }

  shouldCleanPreparedDirectory(): boolean {
    return true;
  }

  async prepare(
    entity: Entity,
    _options?: PreparerOptions,
  ): Promise<PreparerResponse> {
    const annotation = entity.metadata.annotations?.[TECHDOCS_ANNOTATION];
    if (!annotation) {
      throw new InputError(
        `No ${TECHDOCS_ANNOTATION} annotation found on entity`,
      );
    }

    // Parse the annotation: confluence-url:https://...
    const confluenceUrl = this.parseConfluenceAnnotation(annotation);

    this.logger.info(`Fetching Confluence page from: ${confluenceUrl}`);

    // Extract space key and page title/id from URL
    const { spaceKey, pageTitle, pageId } =
      this.parseConfluenceUrl(confluenceUrl);

    // Fetch the Confluence page with children
    const page = await this.fetchConfluencePageWithChildren(
      spaceKey,
      pageTitle,
      pageId,
    );

    // Create a temporary directory for the docs
    const preparedDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'confluence-techdocs-'),
    );

    try {
      // Create docs directory
      const docsDir = path.join(preparedDir, 'docs');
      await fs.mkdir(docsDir);

      // Process the page tree
      const navItems = await this.processPageTree(page, docsDir, '');

      // Create mkdocs.yml with full navigation
      const mkdocsConfig = {
        site_name: page.title,
        docs_dir: 'docs',
        plugins: ['techdocs-core'],
        nav: navItems,
      };

      const mkdocsPath = path.join(preparedDir, 'mkdocs.yml');
      await fs.writeFile(mkdocsPath, YAML.stringify(mkdocsConfig));

      this.logger.info(
        `Successfully prepared Confluence docs at: ${preparedDir}`,
      );

      return {
        preparedDir,
        etag: page.id, // Use page ID as etag for caching
      };
    } catch (error) {
      // Clean up on error
      await fs.remove(preparedDir);
      throw error;
    }
  }

  /**
   * Process a Confluence page tree recursively
   */
  private async processPageTree(
    page: ConfluencePageWithChildren,
    docsDir: string,
    pathPrefix: string,
    depth: number = 0,
  ): Promise<any[]> {
    const navItems: any[] = [];

    // Convert and save the current page (pass title to avoid duplication)
    const markdown = this.convertHtmlToMarkdown(
      page.body.export_view.value,
      pathPrefix === '' ? page.title : undefined, // Only remove title for root page
    );

    // Fetch and process attachments for this page
    const attachments = await this.fetchAttachments(page.id);
    const markdownWithAttachments = await this.processAttachments(
      markdown,
      attachments,
      docsDir,
      pathPrefix, // Pass pathPrefix to calculate correct image paths
    );

    // Determine if the page has any non-empty content after processing
    const hasContent = markdownWithAttachments.trim().length > 0;

    // Create filename from title
    const fileName = pathPrefix
      ? `${pathPrefix}/${this.sanitizeFileName(page.title)}.md`
      : 'index.md';

    const filePath = path.join(docsDir, fileName);

    // Create subdirectory if needed
    const fileDir = path.dirname(filePath);
    await fs.mkdir(fileDir, { recursive: true });

    // Write the markdown file
    await fs.writeFile(filePath, markdownWithAttachments);

    this.logger.debug(`Processed page: ${page.title} -> ${fileName}`);

    // Check if there are child pages
    const childPages = page.children?.page?.results || [];

    // Check if we should process children (respect maxDepth if set)
    const { maxDepth, parallel } = this.config.pageTree;
    const shouldProcessChildren =
      childPages.length > 0 && (maxDepth === 0 || depth < maxDepth);

    if (shouldProcessChildren) {
      // If there are children, create a section with nested items
      const childNavItems: any[] = [];

      // Add "Overview" link to parent page content only if it has content
      if (hasContent) {
        childNavItems.push({ Overview: fileName });
      }

      this.logger.debug(
        `Fetching ${childPages.length} child pages ${
          parallel ? 'in parallel' : 'sequentially'
        }...`,
      );

      const processChild = async (childSummary: {
        id: string;
        title: string;
      }) => {
        this.logger.debug(`Fetching child page: ${childSummary.title}`);

        // Fetch the full child page with its children
        const childPage = await this.fetchConfluencePageById(childSummary.id);

        // Create subdirectory path for child pages
        const childPrefix = pathPrefix
          ? `${pathPrefix}/${this.sanitizeFileName(page.title)}`
          : this.sanitizeFileName(page.title);

        // Recursively process child pages (pass depth + 1)
        return this.processPageTree(childPage, docsDir, childPrefix, depth + 1);
      };

      let childNavResults: any[][];
      if (parallel) {
        // Process child pages in parallel for better performance
        childNavResults = await Promise.all(childPages.map(processChild));
      } else {
        // Process child pages sequentially (useful for rate-limited APIs)
        childNavResults = [];
        for (const childSummary of childPages) {
          const result = await processChild(childSummary);
          childNavResults.push(result);
        }
      }

      // Flatten the nav results
      for (const childNav of childNavResults) {
        childNavItems.push(...childNav);
      }

      // Return as a nested structure
      navItems.push({ [page.title]: childNavItems });
    } else {
      // No children, just add the page
      navItems.push({ [page.title]: fileName });
    }

    return navItems;
  }

  /**
   * Fetch a Confluence page by ID with children
   */
  private async fetchConfluencePageById(
    pageId: string,
  ): Promise<ConfluencePageWithChildren> {
    const apiUrl = `${this.config.baseUrl}/rest/api/content/${pageId}?expand=body.export_view,children.page`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = this.getAuthorizationHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Confluence page ${pageId}: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as ConfluencePageWithChildren;
  }

  /**
   * Check if a URL is a Confluence URL
   */
  static isConfluenceUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Check for common Confluence URL patterns
      return (
        urlObj.pathname.includes('/display/') ||
        urlObj.pathname.includes('/spaces/') ||
        urlObj.pathname.includes('/pages/viewpage.action') ||
        urlObj.hostname.includes('confluence') ||
        urlObj.hostname.includes('.atlassian.net')
      );
    } catch {
      return false;
    }
  }

  private parseConfluenceAnnotation(annotation: string): string {
    // Support both formats:
    // 1. confluence-url:https://...
    // 2. url:https://confluence.company.com/...

    if (annotation.startsWith('confluence-url:')) {
      return annotation.substring('confluence-url:'.length);
    }

    if (annotation.startsWith('url:')) {
      const url = annotation.substring('url:'.length);
      if (ConfluencePreparer.isConfluenceUrl(url)) {
        return url;
      }
    }

    throw new InputError(
      `Invalid Confluence annotation format. Expected "confluence-url:https://..." or "url:https://confluence..." but got "${annotation}"`,
    );
  }

  private parseConfluenceUrl(url: string): {
    spaceKey?: string;
    pageTitle?: string;
    pageId?: string;
  } {
    try {
      const urlObj = new URL(url);

      // Format 1: https://{base}/display/{spacekey}/{page-title}
      const displayMatch = urlObj.pathname.match(/\/display\/([^/]+)\/([^/]+)/);
      if (displayMatch) {
        return {
          spaceKey: displayMatch[1],
          pageTitle: decodeURIComponent(displayMatch[2]),
        };
      }

      // Format 2: https://{base}/spaces/{spacekey}/pages/{pageId}/{page-title}
      const spacesMatch = urlObj.pathname.match(
        /\/spaces\/([^/]+)\/pages\/(\d+)/,
      );
      if (spacesMatch) {
        return {
          spaceKey: spacesMatch[1],
          pageId: spacesMatch[2],
        };
      }

      // Format 3: Direct page ID in query params
      const pageId = urlObj.searchParams.get('pageId');
      if (pageId) {
        return { pageId };
      }

      throw new InputError(
        `Unable to parse Confluence URL format: ${url}. Supported formats:
        - https://{base}/display/{spacekey}/{page-title}
        - https://{base}/spaces/{spacekey}/pages/{pageId}/{page-title}`,
      );
    } catch (error) {
      throw new InputError(`Invalid Confluence URL: ${url}`);
    }
  }

  private async fetchConfluencePageWithChildren(
    spaceKey?: string,
    pageTitle?: string,
    pageId?: string,
  ): Promise<ConfluencePageWithChildren> {
    let apiUrl: string;

    if (pageId) {
      // Fetch by page ID with children
      apiUrl = `${this.config.baseUrl}/rest/api/content/${pageId}?expand=body.export_view,children.page`;
    } else if (spaceKey && pageTitle) {
      // Fetch by space key and title with children
      apiUrl = `${
        this.config.baseUrl
      }/rest/api/content?title=${encodeURIComponent(
        pageTitle,
      )}&spaceKey=${spaceKey}&expand=body.export_view,children.page`;
    } else {
      throw new InputError(
        'Either pageId or both spaceKey and pageTitle must be provided',
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = this.getAuthorizationHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    this.logger.debug(`Fetching from Confluence API: ${apiUrl}`);

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `Confluence page not found: ${pageTitle || pageId}`,
        );
      }
      throw new Error(
        `Failed to fetch Confluence page: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Handle response format based on whether we fetched by ID or search
    if (pageId) {
      return data as ConfluencePageWithChildren;
    }

    // Search results format
    const results = (data as any).results;
    if (!results || results.length === 0) {
      throw new NotFoundError(
        `Confluence page not found: ${pageTitle} in space ${spaceKey}`,
      );
    }
    return results[0] as ConfluencePageWithChildren;
  }

  private async fetchAttachments(
    pageId: string,
  ): Promise<ConfluenceAttachment[]> {
    const apiUrl = `${this.config.baseUrl}/rest/api/content/${pageId}/child/attachment`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = this.getAuthorizationHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      this.logger.warn(`Failed to fetch attachments: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const attachments = (data as any).results || [];

    return attachments;
  }

  private convertHtmlToMarkdown(html: string, pageTitle?: string): string {
    let markdown = NodeHtmlMarkdown.translate(html, {
      keepDataImages: false,
      useLinkReferenceDefinitions: false,
      useInlineLinks: true,
    });

    // Fix Confluence-style anchors: #PageName-AnchorText -> #anchortext
    // Confluence prefixes anchors with page name, but MkDocs only uses the heading text
    markdown = markdown.replace(
      /#[\w-]+-([\w-]+)/g,
      (_match, anchorText) => `#${anchorText.toLowerCase()}`,
    );

    // Remove duplicate heading if the page title appears as first H1
    if (pageTitle) {
      const titleRegex = new RegExp(
        `^#\\s+${pageTitle.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\n`,
        'i',
      );
      markdown = markdown.replace(titleRegex, '');
    }

    return markdown;
  }

  private async processAttachments(
    markdown: string,
    attachments: ConfluenceAttachment[],
    docsDir: string,
    pathPrefix: string = '',
  ): Promise<string> {
    if (attachments.length === 0) {
      return markdown;
    }

    // Create img directory for attachments
    const imgDir = path.join(docsDir, 'img');
    await fs.mkdir(imgDir, { recursive: true });

    let processedMarkdown = markdown;

    // Calculate relative path for images based on nesting level
    const nestingLevel = pathPrefix ? pathPrefix.split('/').length : 0;
    const relativeImgPathPrefix =
      nestingLevel > 0 ? `${'../'.repeat(nestingLevel)}img/` : 'img/';

    // Build a map of draw.io files to their PNG exports
    const drawioToPngMap = new Map<string, ConfluenceAttachment>();
    for (const attachment of attachments) {
      const mediaType =
        attachment.extensions?.mediaType || attachment.metadata?.mediaType;

      // Check if this is a draw.io file
      if (mediaType === 'application/vnd.jgraph.mxfile') {
        // Look for corresponding PNG file
        const pngTitle = `${attachment.title}.png`;
        const pngAttachment = attachments.find(a => a.title === pngTitle);

        if (pngAttachment) {
          drawioToPngMap.set(attachment.title, pngAttachment);
          this.logger.debug(
            `Found PNG export for draw.io diagram: ${attachment.title} -> ${pngTitle}`,
          );
        }
      }
    }

    // Track processed PNG attachments to avoid duplicate downloads
    const processedPngIds = new Set<string>();

    for (const attachment of attachments) {
      try {
        const mediaType =
          attachment.extensions?.mediaType || attachment.metadata?.mediaType;

        // Skip draw.io source files if we have a PNG export
        if (
          mediaType === 'application/vnd.jgraph.mxfile' &&
          drawioToPngMap.has(attachment.title)
        ) {
          this.logger.debug(
            `Skipping draw.io source file, will use PNG export: ${attachment.title}`,
          );
          continue;
        }

        // Skip if this PNG was already processed as part of a draw.io pair
        if (processedPngIds.has(attachment.id)) {
          continue;
        }

        const downloadUrl = `${this.config.baseUrl}${attachment._links.download}`;

        const headers: Record<string, string> = {};
        const authHeader = this.getAuthorizationHeader();
        if (authHeader) {
          headers.Authorization = authHeader;
        }

        const response = await fetch(downloadUrl, { headers });

        if (response.ok) {
          const buffer = await response.buffer();
          const fileName = this.sanitizeFileName(attachment.title);

          const filePath = path.join(imgDir, fileName);
          const data = new Uint8Array(buffer);
          await fs.writeFile(filePath, data);
          this.logger.debug(`Downloaded attachment: ${fileName}`);

          const relativeImgPath = relativeImgPathPrefix + fileName;

          // Replace references in markdown by filename
          const escapedTitle = attachment.title.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          );

          const filenameRegex = new RegExp(
            `(!?\\[.*?\\]\\()([^)]*${escapedTitle}[^)]*)\\)`,
            'gi',
          );

          const beforeReplace = processedMarkdown;
          processedMarkdown = processedMarkdown.replace(
            filenameRegex,
            `$1${relativeImgPath})`,
          );

          if (processedMarkdown !== beforeReplace) {
            this.logger.debug(
              `Replaced reference(s) to ${attachment.title} with ${relativeImgPath}`,
            );
          }

          // Mark this PNG as processed if it's part of a draw.io pair
          if (fileName.endsWith('.png')) {
            processedPngIds.add(attachment.id);
          }
        }
      } catch (error) {
        this.logger.warn(
          `Failed to download attachment ${attachment.title}: ${error}`,
        );
      }
    }

    // Process draw.io references that should point to PNG exports
    for (const [drawioTitle, pngAttachment] of drawioToPngMap.entries()) {
      const pngFileName = this.sanitizeFileName(pngAttachment.title);
      const relativeImgPath = relativeImgPathPrefix + pngFileName;

      // Replace references to draw.io file with PNG file
      const escapedTitle = drawioTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const filenameRegex = new RegExp(
        `(!?\\[.*?\\]\\()([^)]*${escapedTitle}[^)]*)\\)`,
        'gi',
      );

      const beforeReplace = processedMarkdown;
      processedMarkdown = processedMarkdown.replace(
        filenameRegex,
        `$1${relativeImgPath})`,
      );

      if (processedMarkdown !== beforeReplace) {
        this.logger.debug(
          `Replaced draw.io reference(s) ${drawioTitle} with PNG: ${relativeImgPath}`,
        );
      }
    }

    return processedMarkdown;
  }

  private sanitizeFileName(fileName: string): string {
    // Replace spaces and special characters
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}
