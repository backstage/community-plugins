/*
 * Copyright 2024 The Backstage Authors
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
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import pLimit from 'p-limit';
import { LoggerService } from '@backstage/backend-plugin-api';
import pThrottle from 'p-throttle';

/**
 * Document metadata
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
};

/**
 * List of documents
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
 * Options for {@link ConfluenceCollatorFactory}
 *
 * @public
 */
export type ConfluenceCollatorFactoryOptions = {
  baseUrl?: string;
  auth?: string;
  token?: string;
  email?: string;
  username?: string;
  password?: string;
  spaces?: string[];
  query?: string;
  parallelismLimit?: number;
  maxRequestsPerSecond?: number;
  logger: LoggerService;
};

/**
 * Document
 *
 * @public
 */
export type ConfluenceDocument = ConfluenceDocumentMetadata & {
  body: {
    storage: {
      value: string;
    };
  };
  version: {
    by: {
      publicName: string;
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
 * Parent document
 *
 * @public
 */
export type IndexableAncestorRef = {
  id?: string;
  title: string;
  location: string;
};

/**
 * Extended IndexableDocument with test specific properties
 *
 * @public
 */
export interface IndexableConfluenceDocument extends IndexableDocument {
  spaceKey: string;
  spaceName: string;
  ancestors: IndexableAncestorRef[];
  lastModified: string;
  lastModifiedFriendly: string;
  lastModifiedBy: string;
}

/**
 * Search collator responsible for collecting confluence documents to index.
 *
 * @public
 */
export class ConfluenceCollatorFactory implements DocumentCollatorFactory {
  private readonly baseUrl: string | undefined;
  private readonly auth: string | undefined;
  private readonly token: string | undefined;
  private readonly email: string | undefined;
  private readonly username: string | undefined;
  private readonly password: string | undefined;
  private readonly spaces: string[] | undefined;
  private readonly query: string | undefined;
  private readonly parallelismLimit: number | undefined;
  private readonly logger: LoggerService;
  public readonly type: string = 'confluence';
  private readonly fetch: (
    url: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response>;

  private constructor(options: ConfluenceCollatorFactoryOptions) {
    this.baseUrl = options.baseUrl;
    this.auth = options.auth;
    this.token = options.token;
    this.email = options.email;
    this.username = options.username;
    this.password = options.password;
    this.spaces = options.spaces;
    this.query = options.query;
    this.parallelismLimit = options.parallelismLimit;
    this.logger = options.logger.child({ documentType: this.type });

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

  static fromConfig(config: Config, options: ConfluenceCollatorFactoryOptions) {
    const baseUrl = config.getString('confluence.baseUrl');
    const auth = config.getOptionalString('confluence.auth.type') ?? 'bearer';
    const token = config.getOptionalString('confluence.auth.token');
    const email = config.getOptionalString('confluence.auth.email');
    const username = config.getOptionalString('confluence.auth.username');
    const password = config.getOptionalString('confluence.auth.password');
    const spaces = config.getOptionalStringArray('confluence.spaces') ?? [];
    const query = config.getOptionalString('confluence.query') ?? '';

    const parallelismLimit = config.getOptionalNumber(
      'confluence.parallelismLimit',
    );

    if ((auth === 'basic' || auth === 'bearer') && !token) {
      throw new Error(
        `No token provided for the configured '${auth}' auth method`,
      );
    }

    if (auth === 'basic' && !email) {
      throw new Error(
        `No email provided for the configured '${auth}' auth method`,
      );
    }

    if (auth === 'userpass' && (!username || !password)) {
      throw new Error(
        `No username/password provided for the configured '${auth}' auth method`,
      );
    }

    return new ConfluenceCollatorFactory({
      ...options,
      baseUrl,
      auth,
      token,
      email,
      username,
      password,
      spaces,
      query,
      parallelismLimit,
      maxRequestsPerSecond: config.getOptionalNumber(
        'confluence.maxRequestsPerSecond',
      ),
    });
  }
  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<IndexableConfluenceDocument> {
    const query = await this.getConfluenceQuery();
    const documentsList = await this.getDocuments(query);

    this.logger.debug(`Document list: ${JSON.stringify(documentsList)}`);

    const limit = pLimit(this.parallelismLimit || 15);
    const documentsInfo = documentsList.map(document =>
      limit(async () => {
        try {
          return this.getDocumentInfo(document);
        } catch (err) {
          this.logger.warn(
            `error while indexing document "${document}": ${err}`,
          );
        }

        return [];
      }),
    );

    const safePromises = documentsInfo.map(promise =>
      promise.catch(error => {
        this.logger.warn(error);

        return [];
      }),
    );

    const documents = (await Promise.all(safePromises)).flat();

    for (const document of documents) {
      yield document;
    }
  }

  private async getSpacesConfig(): Promise<string[]> {
    const spaceList: string[] = [];
    if (this.spaces?.length === 0) {
      return spaceList;
    }
    return this.spaces || [];
  }

  private async getConfluenceQuery(): Promise<string> {
    const spaceList = await this.getSpacesConfig();
    const spaceQuery =
      spaceList.length > 0
        ? spaceList.map(s => `space="${s}"`).join(' or ')
        : '';
    const additionalQuery = this.query?.trim() ?? '';

    let query = '';
    if (spaceQuery && additionalQuery) {
      query = `(${spaceQuery}) and (${additionalQuery})`;
    } else if (spaceQuery) {
      query = spaceQuery;
    } else if (additionalQuery) {
      query = additionalQuery;
    }
    // If no query is provided, default to fetching all pages, blogposts, comments and attachments (which encompasses all content)
    // https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/#type
    if (query === '') {
      this.logger.info(
        `No confluence query nor spaces provided via config, so will index all pages, blogposts, comments and attachments`,
      );
      query = 'type IN (page, blogpost, comment, attachment)';
    }
    return query;
  }

  private async getDocuments(query: string): Promise<string[]> {
    const documentsList = [];

    this.logger.info(`Exploring documents using query: ${query}`);

    let next = true;
    let requestUrl = `${this.baseUrl}/rest/api/content/search?limit=1000&status=current&cql=${query}`;
    while (next) {
      const data = await this.get<ConfluenceDocumentList>(requestUrl);
      if (!data.results) {
        break;
      }

      documentsList.push(
        ...data.results.map(
          result => `${this.baseUrl}/rest/api/content/${result.id}`,
        ),
      );

      if (data._links.next) {
        requestUrl = `${this.baseUrl}${data._links.next}`;
      } else {
        next = false;
      }
    }

    return documentsList;
  }

  private async getDocumentInfo(
    documentUrl: string,
  ): Promise<IndexableConfluenceDocument[]> {
    this.logger.debug(`Fetching document content: "${documentUrl}"`);

    const data = await this.get<ConfluenceDocument>(
      `${documentUrl}?expand=body.storage,space,ancestors,version`,
    );
    if (!data.status || data.status !== 'current') {
      return [];
    }

    const ancestors: IndexableAncestorRef[] = [
      {
        title: data.space.name,
        location: `${data._links.base}${data.space._links.webui}`,
      },
    ];

    data.ancestors.forEach(ancestor => {
      ancestors.push({
        title: ancestor.title,
        location: `${data._links.base}${ancestor._links.webui}`,
      });
    });

    return [
      {
        title: data.title,
        text: this.stripHtml(data.body.storage.value),
        location: `${data._links.base}${data._links.webui}`,
        spaceKey: data.space.key,
        spaceName: data.space.name,
        ancestors: ancestors,
        lastModifiedBy: data.version.by.publicName,
        lastModified: data.version.when,
        lastModifiedFriendly: data.version.friendlyWhen,
      },
    ];
  }

  private stripHtml(input: string): string {
    return input.replace(/(<([^>]+)>)/gi, '');
  }

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

  private async get<T = any>(requestUrl: string): Promise<T> {
    const res = await this.fetch(requestUrl, {
      method: 'get',
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });

    if (!res.ok) {
      this.logger.warn(
        `non-ok response from confluence: "${requestUrl}", status: "${
          res.status
        }", "${await res.text()}"`,
      );

      throw new Error(`Request failed with ${res.status} ${res.statusText}`);
    }
    return await res.json();
  }
}
