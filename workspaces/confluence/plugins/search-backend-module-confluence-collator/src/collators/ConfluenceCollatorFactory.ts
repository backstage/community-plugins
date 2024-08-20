import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Document metadata
 *
 * @public
 */
export type ConfluenceDocumentMetadata = {
  title: string;
  status: string;

  _links: {
    self: string;
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
  parallelismLimit?: number;
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
  private readonly parallelismLimit: number | undefined;
  private readonly logger: LoggerService;
  public readonly type: string = 'confluence';

  private constructor(options: ConfluenceCollatorFactoryOptions) {
    this.baseUrl = options.baseUrl;
    this.auth = options.auth;
    this.token = options.token;
    this.email = options.email;
    this.username = options.username;
    this.password = options.password;
    this.spaces = options.spaces;
    this.parallelismLimit = options.parallelismLimit;
    this.logger = options.logger.child({ documentType: this.type });
  }

  static fromConfig(config: Config, options: ConfluenceCollatorFactoryOptions) {
    const baseUrl = config.getString('confluence.baseUrl');
    const auth = config.getOptionalString('confluence.auth.type') ?? 'bearer';
    const token = config.getOptionalString('confluence.auth.token');
    const email = config.getOptionalString('confluence.auth.email');
    const username = config.getOptionalString('confluence.auth.username');
    const password = config.getOptionalString('confluence.auth.password');
    const spaces = config.getOptionalStringArray('confluence.spaces') ?? [];
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
      parallelismLimit,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<IndexableConfluenceDocument> {
    let spacesList: string[] = await this.getSpacesConfig();

    if (spacesList.length === 0) {
      this.logger.info(
        'No confluence.spaces configured in app-config.yaml, fetching all spaces',
      );

      spacesList = await this.discoverSpaces();
    }

    this.logger.info(`Indexing spaces: ${JSON.stringify(spacesList)}`);

    const documentsList = await this.getDocumentsFromSpaces(spacesList);

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

  private async discoverSpaces(): Promise<string[]> {
    const data = await this.get(
      `${this.baseUrl}/rest/api/space?&limit=1000&type=global&status=current`,
    );

    if (!data.results) {
      return [];
    }

    const spacesList = [];
    for (const result of data.results) {
      spacesList.push(result.key);
    }

    this.logger.debug(`Discovered spaces: ${JSON.stringify(spacesList)}`);

    return spacesList;
  }

  private async getSpacesConfig(): Promise<string[]> {
    const spaceList: string[] = [];
    if (this.spaces?.length === 0) {
      return spaceList;
    }
    return this.spaces || [];
  }

  private async getDocumentsFromSpace(space: string): Promise<string[]> {
    const documentsList = [];

    this.logger.info(`Exploring space: "${space}"`);

    let next = true;
    let requestUrl = `${this.baseUrl}/rest/api/content?limit=1000&status=current&spaceKey=${space}`;
    while (next) {
      const data = await this.get<ConfluenceDocumentList>(requestUrl);
      if (!data.results) {
        break;
      }

      documentsList.push(...data.results.map(result => result._links.self));

      if (data._links.next) {
        requestUrl = `${this.baseUrl}${data._links.next}`;
      } else {
        next = false;
      }
    }

    return documentsList;
  }

  private async getDocumentsFromSpaces(spaces: string[]): Promise<string[]> {
    const documentsList = [];

    for (const space of spaces) {
      documentsList.push(...(await this.getDocumentsFromSpace(space)));
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
        location: `${this.baseUrl}${data.space._links.webui}`,
      },
    ];

    data.ancestors.forEach(ancestor => {
      ancestors.push({
        title: ancestor.title,
        location: `${this.baseUrl}${ancestor._links.webui}`,
      });
    });

    return [
      {
        title: data.title,
        text: this.stripHtml(data.body.storage.value),
        location: `${this.baseUrl}${data._links.webui}`,
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
    const res = await fetch(requestUrl, {
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
