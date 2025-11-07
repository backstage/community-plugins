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

import { LoggerService, DiscoveryService } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import TurndownService from 'turndown';

/**
 * TechDocsMetadata
 *
 * @public
 */
export interface TechDocsMetadata {
  site_name?: string;
  site_description?: string;
  etag?: string;
  build_timestamp?: number;
  files?: string[];
  error?: string;
}

/**
 * TechDocsEntity
 *
 * @public
 */
export interface TechDocsEntity {
  name: string;
  tags: string;
  description: string;
  owner: string;
  lifecycle: string;
  namespace: string;
  title: string;
  kind: string;
}

/**
 * TechDocsEntityWithUrls
 *
 * @public
 */
export interface TechDocsEntityWithUrls extends TechDocsEntity {
  techDocsUrl: string;
  metadataUrl: string;
}

/**
 * TechDocsEntityWithMetadata
 *
 * @public
 */
export interface TechDocsEntityWithMetadata extends TechDocsEntityWithUrls {
  metadata?: {
    lastUpdated?: string;
    buildTimestamp?: number;
    siteName?: string;
    siteDescription?: string;
    etag?: string;
    files?: string;
  };
}

/**
 * TechDocsContentResult
 *
 * @public
 */
export interface TechDocsContentResult {
  entityRef: string;
  name: string;
  title: string;
  kind: string;
  namespace: string;
  content: string;
  pageTitle?: string;
  lastModified?: string;
  path?: string;
  contentType: 'markdown' | 'html' | 'text';
  metadata?: {
    lastUpdated?: string;
    buildTimestamp?: number;
    siteName?: string;
    siteDescription?: string;
  };
  error?: string;
}

/**
 * ListTechDocsOptions
 *
 * @public
 */
export interface ListTechDocsOptions {
  entityType?: string;
  namespace?: string;
  owner?: string;
  lifecycle?: string;
  tags?: string;
  limit?: number;
}

/**
 * TechDocsCoverageResult
 *
 * @public
 */
export interface TechDocsCoverageResult {
  totalEntities: number;
  entitiesWithDocs: number;
  coveragePercentage: number;
}

/**
 * TechDocsService
 *
 * @public
 */
export class TechDocsService {
  private turndownService: TurndownService;

  constructor(
    private config: Config,
    private logger: LoggerService,
    private discovery: DiscoveryService,
    private fetchFunction?: any,
  ) {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });
  }

  // convertHtmlToText:: converts an HTML text to markdown/text using turndown
  private convertHtmlToText(html: string): string {
    try {
      return this.turndownService.turndown(html);
    } catch (error) {
      this.logger.warn(
        'Failed to convert HTML with turndown, falling back to plain text',
        error,
      );
      // we fallback to simple text extraction if turndown fails
      return html
        .replace(/<(script|style)[^>]*>.*?<\/\1>/gims, '')
        .replace(/<!--.*?-->/gims, '')
        .replace(/<[^>]*>/gims, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  // generateTechDocsUrls:: creates the techdoc urls
  async generateTechDocsUrls(
    entity: Entity,
  ): Promise<{ techDocsUrl: string; metadataUrl: string }> {
    const appBaseUrl = this.config.getString('app.baseUrl');
    const backendBaseUrl = this.config.getString('backend.baseUrl');

    const { namespace = 'default', name } = entity.metadata;
    const kind = entity.kind.toLowerCase();

    return {
      techDocsUrl: `${appBaseUrl}/docs/${namespace}/${kind}/${name}`,
      metadataUrl: `${backendBaseUrl}/api/catalog/entities/by-name/${kind}/${namespace}/${name}`,
    };
  }

  // fetchTechDocsMetadata:: fetches all metadata for given entity
  async fetchTechDocsMetadata(
    entity: Entity,
    auth?: any,
  ): Promise<TechDocsMetadata> {
    try {
      const { namespace = 'default', name } = entity.metadata;
      const kind = entity.kind.toLowerCase();

      const techdocsBaseUrl = await this.discovery.getBaseUrl('techdocs');
      const metadataUrl = `${techdocsBaseUrl}/static/docs/${namespace}/${kind}/${name}/techdocs_metadata.json`;

      this.logger.debug(`Fetching metadata from URL: ${metadataUrl}`);
      const fetch = this.fetchFunction || (await import('node-fetch')).default;

      const headers: Record<string, string> = {};

      if (auth) {
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await auth.getOwnServiceCredentials(),
          targetPluginId: 'techdocs',
        });
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(metadataUrl, { headers });

      if (!response.ok) {
        // in case of 404 we return an empty metadata object
        if (response.status === 404) {
          this.logger.debug(
            `TechDocs metadata not found for ${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`,
          );
          return {};
        }
        // in case of general error (non-404) we return error message
        const errorMsg = `Failed to fetch TechDocs metadata: ${response.status} ${response.statusText}`;
        this.logger.warn(errorMsg);
        return { error: errorMsg };
      }

      const metadata = await response.json();
      return metadata as TechDocsMetadata;
    } catch (error) {
      const errorMsg = `Failed to fetch TechDocs metadata for ${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}: ${error}`;
      this.logger.warn(errorMsg);
      return { error: errorMsg };
    }
  }

  // retrieveTechDocsContent:: fetches TechDoc content
  // for given entity
  async retrieveTechDocsContent(
    entityRef: string,
    pagePath?: string,
    auth?: any,
    catalog?: CatalogService,
  ): Promise<TechDocsContentResult> {
    const [kind, namespaceAndName] = entityRef.split(':');
    const [namespace = 'default', name] = namespaceAndName?.split('/') || [];

    // early return if name or kind are missing
    if (!kind || !name) {
      const errorMsg = `Invalid entity reference format: ${entityRef}. Expected format: kind:namespace/name`;
      this.logger.error(errorMsg);
      return {
        entityRef,
        name: '',
        title: '',
        kind: '',
        namespace: '',
        content: '',
        contentType: 'text',
        error: errorMsg,
      };
    }

    try {
      let entity: Entity | undefined;

      // get entity
      if (catalog && auth) {
        const credentials = await auth.getOwnServiceCredentials();
        this.logger.info(credentials);
        const entityResponse = await catalog.getEntityByRef(
          { kind, namespace, name },
          { credentials },
        );
        entity = entityResponse || undefined;
      }

      // return error message if entity is not found or does not have techdocs-ref annotation
      if (
        entity &&
        !entity.metadata?.annotations?.['backstage.io/techdocs-ref']
      ) {
        const errorMsg = `Entity ${entityRef} does not have TechDocs configured`;
        this.logger.error(errorMsg);
        return {
          entityRef,
          name,
          title: entity.metadata?.title || name,
          kind,
          namespace,
          content: '',
          contentType: 'text',
          error: errorMsg,
        };
      }

      // set target path to default if not specified
      const targetPath = pagePath || 'index.html';

      this.logger.info(
        `Fetching TechDocs content for ${entityRef} at path: ${targetPath}`,
      );

      const techdocsBaseUrl = await this.discovery.getBaseUrl('techdocs');
      const contentUrl = `${techdocsBaseUrl}/static/docs/${namespace}/${kind.toLowerCase()}/${name}/${targetPath}`;

      this.logger.debug(`Fetching content from URL: ${contentUrl}`);
      const fetch = this.fetchFunction || (await import('node-fetch')).default;
      const headers: Record<string, string> = {};

      if (auth) {
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await auth.getOwnServiceCredentials(),
          targetPluginId: 'techdocs',
        });
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(contentUrl, { headers });

      // check response status and return error if not ok
      if (!response.ok) {
        let errorMsg: string;

        if (response.status === 404) {
          errorMsg = `TechDocs content not found for ${entityRef} at path: ${targetPath}. The documentation may not have been built yet. Please visit the TechDocs page to trigger a build.`;
        } else {
          errorMsg = `Failed to fetch TechDocs content: ${response.status} ${response.statusText}`;
        }

        this.logger.error(errorMsg);
        return {
          entityRef,
          name,
          title: entity?.metadata?.title || name,
          kind,
          namespace,
          content: '',
          contentType: 'text',
          error: errorMsg,
        };
      }

      let content = await response.text();

      // fetch metadata for entity
      const metadata = await this.fetchTechDocsMetadata(
        entity ||
          ({
            kind,
            metadata: { name, namespace },
          } as Entity),
        auth,
      );

      // try to convert any type to raw text
      let contentType: 'markdown' | 'html' | 'text' = 'text';
      if (targetPath.endsWith('.md')) {
        contentType = 'markdown';
      } else if (targetPath.endsWith('.html') || targetPath.endsWith('.htm')) {
        contentType = 'html';
      }

      // get page title
      let pageTitle: string | undefined;
      if (contentType === 'html') {
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          pageTitle = titleMatch[1].trim();
        }
        content = this.convertHtmlToText(content);
        contentType = 'text';
      }

      return {
        entityRef,
        name,
        title: entity?.metadata?.title || name,
        kind,
        namespace,
        content,
        pageTitle,
        path: targetPath,
        contentType,
        lastModified: metadata?.build_timestamp
          ? new Date(metadata.build_timestamp * 1000).toISOString()
          : undefined,
        metadata: metadata
          ? {
              lastUpdated: metadata.build_timestamp
                ? new Date(metadata.build_timestamp * 1000).toISOString()
                : undefined,
              buildTimestamp: metadata.build_timestamp,
              siteName: metadata.site_name,
              siteDescription: metadata.site_description,
            }
          : undefined,
      };
    } catch (error) {
      const errorMsg = `Failed to retrieve TechDocs content for ${entityRef}: ${error}`;
      this.logger.error(errorMsg);
      return {
        entityRef,
        name: '',
        title: '',
        kind: '',
        namespace: '',
        content: '',
        contentType: 'text',
        error: errorMsg,
      };
    }
  }

  // analyzeCoverage:: analyzes the coverage of techdoc in the catalog
  // @public
  async analyzeCoverage(
    options: ListTechDocsOptions = {},
    auth: any,
    catalog: CatalogService,
  ): Promise<TechDocsCoverageResult> {
    const {
      entityType,
      namespace,
      owner,
      lifecycle,
      tags,
      limit = 500,
    } = options;
    const credentials = await auth.getOwnServiceCredentials();

    this.logger.info('Analyzing TechDocs coverage...');

    const filters: Record<string, string | string[]> = {};
    if (entityType) {
      filters.kind = entityType;
    }
    if (namespace) {
      filters['metadata.namespace'] = namespace;
    }
    if (owner) {
      filters['spec.owner'] = owner;
    }
    if (lifecycle) {
      filters['spec.lifecycle'] = lifecycle;
    }
    if (tags) {
      filters['metadata.tags'] = tags.split(',').map(tag => tag.trim());
    }

    const getEntitiesOptions: any = {
      filter: Object.keys(filters).length > 0 ? filters : undefined,
      fields: [
        'kind',
        'metadata.namespace',
        'metadata.name',
        'metadata.annotations',
      ],
      limit,
    };

    const resp = await catalog.getEntities(getEntitiesOptions, { credentials });
    const totalEntities = resp.items.length;

    const entitiesWithDocs = resp.items.filter(
      entity => entity.metadata?.annotations?.['backstage.io/techdocs-ref'],
    ).length;

    const coveragePercentage =
      totalEntities > 0 ? (entitiesWithDocs / totalEntities) * 100 : 0;

    this.logger.info(
      `Coverage analysis complete: ${entitiesWithDocs}/${totalEntities} entities (${coveragePercentage.toFixed(
        1,
      )}%) have TechDocs`,
    );

    return {
      totalEntities,
      entitiesWithDocs,
      coveragePercentage: Math.round(coveragePercentage * 10) / 10, // Round to 1 decimal place
    };
  }

  // listTechDocs:: lists all techdoc entities
  async listTechDocs(
    options: ListTechDocsOptions = {},
    auth: any,
    catalog: CatalogService,
  ): Promise<{ entities: TechDocsEntityWithMetadata[] }> {
    const {
      entityType,
      namespace,
      owner,
      lifecycle,
      tags,
      limit = 500,
    } = options;
    const credentials = await auth.getOwnServiceCredentials();

    this.logger.info('Fetching entities from catalog...');
    const filters: Record<string, string | string[]> = {};
    if (entityType) {
      filters.kind = entityType;
    }
    if (namespace) {
      filters['metadata.namespace'] = namespace;
    }
    if (owner) {
      filters['spec.owner'] = owner;
    }
    if (lifecycle) {
      filters['spec.lifecycle'] = lifecycle;
    }
    if (tags) {
      filters['metadata.tags'] = tags.split(',').map(tag => tag.trim());
    }

    const getEntitiesOptions: any = {
      filter: Object.keys(filters).length > 0 ? filters : undefined,
      fields: [
        'kind',
        'metadata.namespace',
        'metadata.name',
        'metadata.title',
        'metadata.annotations',
        'metadata.tags',
        'metadata.description',
        'metadata.owner',
        'metadata.lifecycle',
        'spec.lifecycle',
        'spec.owner',
      ],
      limit,
    };

    const resp = await catalog.getEntities(getEntitiesOptions, { credentials });

    this.logger.info(
      `Found ${resp.items.length} entities, filtering for techdocs-ref annotation`,
    );

    // filter entities that have techdocs
    const entitiesWithTechDocs = resp.items.filter(
      entity => entity.metadata?.annotations?.['backstage.io/techdocs-ref'],
    );

    const entities = await Promise.all(
      entitiesWithTechDocs.map(async entity => {
        const urls = await this.generateTechDocsUrls(entity);
        const techDocsMetadata = await this.fetchTechDocsMetadata(entity, auth);

        const metadata =
          techDocsMetadata.error || !techDocsMetadata.build_timestamp
            ? undefined
            : {
                lastUpdated: techDocsMetadata.build_timestamp
                  ? new Date(
                      techDocsMetadata.build_timestamp * 1000,
                    ).toISOString()
                  : undefined,
                buildTimestamp: techDocsMetadata.build_timestamp,
                siteName: techDocsMetadata.site_name,
                siteDescription: techDocsMetadata.site_description,
                etag: techDocsMetadata.etag,
                files: techDocsMetadata.files?.join(',') || '',
              };

        return {
          name: entity.metadata.name,
          title: entity.metadata.title || '',
          tags: entity.metadata.tags?.join(',') || '',
          description: entity.metadata.description || '',
          owner: String(entity.metadata.owner || entity.spec?.owner || ''),
          lifecycle: String(
            entity.metadata.lifecycle || entity.spec?.lifecycle || '',
          ),
          namespace: entity.metadata.namespace || 'default',
          kind: entity.kind,
          techDocsUrl: urls.techDocsUrl,
          metadataUrl: urls.metadataUrl,
          metadata,
        };
      }),
    );

    this.logger.info(
      `Successfully found ${entities.length} entities with TechDocs`,
    );

    return { entities };
  }
}
