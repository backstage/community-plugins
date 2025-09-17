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
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import pThrottle from 'p-throttle';
import { LoggerService, CacheService } from '@backstage/backend-plugin-api';

/**
 * Document metadata from Confluence API
 *
 * @public
 */
export type ConfluenceDocumentMetadata = {
  id: string;
  title: string;
  status: string;
  _links: {
    base?: string; // not available when listing documents with search API
    webui: string;
  };
  version?: {
    when: string;
  };
};

/**
 * List of documents from Confluence API
 *
 * @public
 */
export type ConfluenceDocumentList = {
  results: ConfluenceDocumentMetadata[];
  _links: {
    next: string;
  };
};

/**
 * Full document from Confluence API
 *
 * @public
 */
export type ConfluenceDocument = ConfluenceDocumentMetadata & {
  type:
    | 'page'
    | 'blogpost'
    | 'comment'
    | 'attachment'
    | 'folder'
    | 'embed'
    | 'database';
  body: {
    storage: {
      value: string;
    };
  };
  version: {
    by: {
      displayName: string;
      publicName: string;
      email?: string;
      accountStatus?: string;
    };
    when: string;
    friendlyWhen: string;
  };
  space: {
    key: string;
    name: string;
    _links: {
      webui: string;
    };
  };
  ancestors: ConfluenceDocumentMetadata[];
};

/**
 * Configuration options for ConfluenceClient
 *
 * @public
 */
export type ConfluenceClientOptions = {
  baseUrl: string;
  auth: string;
  token?: string;
  email?: string;
  username?: string;
  password?: string;
  maxRequestsPerSecond?: number;
  logger: LoggerService;
  cache?: CacheService;
  documentCacheTtl?: number; // ms
};

/**
 * Document metadata with version info for caching
 *
 * @public
 */
export type DocumentMetadata = {
  url: string;
  versionWhen?: string;
};

/**
 * Client for interacting with Confluence API with rate limiting support
 *
 * @public
 */
export class ConfluenceClient {
  private static readonly CACHE_VERSION = 'v1'; // Increment this if cache format changes

  private readonly baseUrl: string;
  private readonly auth: string;
  private readonly token?: string;
  private readonly email?: string;
  private readonly username?: string;
  private readonly password?: string;
  private readonly logger: LoggerService;
  private readonly cache?: CacheService;
  private readonly documentCacheTtl?: number;
  private readonly fetch: (
    url: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response>;

  constructor(options: ConfluenceClientOptions) {
    this.baseUrl = options.baseUrl;
    this.auth = options.auth;
    this.token = options.token;
    this.email = options.email;
    this.username = options.username;
    this.password = options.password;
    this.logger = options.logger.child({ client: 'confluence' });
    this.cache = options.cache;
    this.documentCacheTtl = options.documentCacheTtl;

    if (options.maxRequestsPerSecond) {
      const throttle = pThrottle({
        limit: options.maxRequestsPerSecond,
        interval: 1000,
      });
      this.fetch = throttle(async (url: RequestInfo, init?: RequestInit) => {
        const response = await fetch(url, init);
        return response;
      });
    } else {
      this.fetch = fetch;
    }
  }

  /**
   * Search for documents using CQL query, including version info for caching
   */
  async searchDocuments(query: string): Promise<DocumentMetadata[]> {
    const documentsList = [];

    this.logger.info(`Exploring documents using query: ${query}`);

    let next = true;
    let requestUrl = `${this.baseUrl}/rest/api/content/search?limit=1000&status=current&expand=version&cql=${query}`;
    while (next) {
      const data = await this.get<ConfluenceDocumentList>(requestUrl);
      if (!data.results) {
        break;
      }

      documentsList.push(
        ...data.results.map(result => ({
          // Do not use _links.self, which does not work when using scoped tokens, see #4615
          url: `${this.baseUrl}/rest/api/content/${result.id}`,
          versionWhen: result.version?.when,
        })),
      );

      if (data._links.next) {
        requestUrl = `${this.baseUrl}${data._links.next}`;
      } else {
        next = false;
      }
    }

    return documentsList;
  }

  /**
   * Get detailed document information with caching support
   */
  async getDocument(
    documentUrl: string,
    versionWhen?: string,
  ): Promise<ConfluenceDocument | null> {
    // If cache is undefined, caching is disabled (see factory logic)
    // Extract content ID from URL for cache key
    const contentId = this.extractContentIdFromUrl(documentUrl);

    // If we have cache service and version info, check cache first
    if (this.cache && contentId && versionWhen) {
      try {
        const cacheKey = this.generateCacheKey(contentId, versionWhen);

        // Try to get from cache first
        const cachedDocument = await this.cache.get<ConfluenceDocument>(
          cacheKey,
        );
        if (cachedDocument) {
          this.logger.debug(`Cache hit for document: "${documentUrl}"`);
          return cachedDocument;
        }

        this.logger.debug(
          `Cache miss for document: "${documentUrl}", fetching from Confluence`,
        );

        // Cache miss, fetch full document
        const data = await this.get<ConfluenceDocument>(
          `${documentUrl}?expand=body.storage,space,ancestors,version`,
        );

        if (!data.status || data.status !== 'current') {
          return null;
        }

        // Cache the result with configured TTL (default 24h)
        await this.cache.set(cacheKey, data, {
          ttl: this.documentCacheTtl ?? 24 * 60 * 60 * 1000,
        });
        return data;
      } catch (error) {
        this.logger.warn(
          `Cache operation failed for "${documentUrl}": ${error}`,
        );
        // Fall back to normal fetching
      }
    }

    // No cache service, no version info, or cache failed - fetch normally
    this.logger.debug(`Fetching document content: "${documentUrl}"`);
    const data = await this.get<ConfluenceDocument>(
      `${documentUrl}?expand=body.storage,space,ancestors,version`,
    );

    if (!data.status || data.status !== 'current') {
      return null;
    }

    return data;
  }

  /**
   * Get the base URL for building links
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Extract content ID from Confluence document URL
   */
  private extractContentIdFromUrl(documentUrl: string): string | null {
    // Confluence URLs typically have format: .../rest/api/content/{id}
    const regex = /\/rest\/api\/content\/(\d+)/;
    const match = regex.exec(documentUrl);
    return match ? match[1] : null;
  }

  /**
   * Generate cache key for document
   */
  private generateCacheKey(contentId: string, versionId?: string): string {
    return `confluence:${contentId}:${versionId || 'unknown'}:${
      ConfluenceClient.CACHE_VERSION
    }`;
  }

  /**
   * Generic GET request method
   */
  private async get<T>(requestUrl: string): Promise<T> {
    const response = await this.fetch(requestUrl, {
      method: 'get',
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'Unable to read response');
      this.logger.warn(
        `non-ok response from confluence: "${requestUrl}", status: "${response.status}", body: "${errorText}"`,
      );
      throw new Error(
        `Request failed with ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get authorization header based on auth method
   */
  private getAuthorizationHeader(): string {
    switch (this.auth) {
      case 'bearer':
        return `Bearer ${this.token}`;
      case 'basic': {
        const buffer = Buffer.from(`${this.email}:${this.token}`, 'utf8');
        return `Basic ${buffer.toString('base64')}`;
      }
      case 'userpass': {
        const buffer = Buffer.from(`${this.username}:${this.password}`, 'utf8');
        return `Basic ${buffer.toString('base64')}`;
      }
      default:
        throw new Error(`Unknown auth method '${this.auth}' provided`);
    }
  }
}
