/*
 * Copyright 2026 The Backstage Authors
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
import { LoggerService, RootConfigService, AuthService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Storage } from '@google-cloud/storage';
import { DocumentServiceClient } from '@google-cloud/discoveryengine';
import crypto from 'crypto';

export async function runCatalogCleanupSweeper(options: {
  config: RootConfigService;
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
}) {
  const { config, logger, catalog, auth } = options;
  const storage = new Storage();

  // Read configured TechDocs GCS bucket name
  const bucketName = config.getOptionalString(
    'techdocs.publisher.googleGcs.bucketName',
  );

  if (!bucketName) {
    logger.warn(
      'TechDocs GCS bucketName is not configured. TechDocs Orphan Sweeper is disabled.',
    );
    return;
  }

  try {
    logger.info('TechDocs Orphan Sweeper: starting sweep...');

    // Retrieve system credentials to authenticate the catalog client call
    const credentials = await auth.getOwnServiceCredentials();

    // 1. Fetch all active components from Catalog
    const catalogResponse = await catalog.getEntities(
      {
        filter: { kind: 'component' },
        fields: ['metadata.name', 'metadata.namespace', 'kind'],
      },
      { credentials },
    );

    const activeEntities = catalogResponse.items || [];
    const activeComponentKeys = new Set(
      activeEntities.map((e: any) => {
        const name = e.metadata.name;
        const namespace = e.metadata.namespace || 'default';
        return `${namespace}/component/${name}`.toLowerCase();
      }),
    );

    logger.info(
      `TechDocs Orphan Sweeper: found ${activeComponentKeys.size} active components in catalog.`,
    );

    // 2. List all files in the TechDocs bucket
    const [files] = await storage.bucket(bucketName!).getFiles();
    const orphanPrefixes = new Set<string>();

    for (const file of files) {
      const parts = file.name.split('/');
      // GCS paths are formatted as: namespace/kind/name/...
      if (parts.length >= 3) {
        const namespace = parts[0];
        const kind = parts[1];
        const name = parts[2];

        // We only care about component folders
        if (kind.toLowerCase() === 'component') {
          const key = `${namespace}/${kind}/${name}`.toLowerCase();
          if (!activeComponentKeys.has(key)) {
            orphanPrefixes.add(`${namespace}/${kind}/${name}`);
          }
        }
      }
    }

    if (orphanPrefixes.size === 0) {
      logger.info(
        'TechDocs Orphan Sweeper: no orphaned folders found in GCS.',
      );
      return;
    }

    logger.info(
      `TechDocs Orphan Sweeper: found ${
        orphanPrefixes.size
      } orphaned folders to purge: ${Array.from(orphanPrefixes).join(
        ', ',
      )}`,
    );

    // 3. For each orphaned prefix, perform GDE & GCS cleanup
    for (const prefix of orphanPrefixes) {
      const parts = prefix.split('/');
      const entityNamespace = parts[0];
      const kind = parts[1];
      const name = parts[2];

      logger.info(
        `TechDocs Orphan Sweeper: purging orphan ${prefix}...`,
      );

      // A. Try to read the orphaned component's search_index.json to delete documents in GDE
      const gcsIndexPath = `${prefix}/search_index.json`;
      let docs: Array<{
        title: string;
        text: string;
        location: string;
      }> = [];

      try {
        const file = storage.bucket(bucketName!).file(gcsIndexPath);
        const [fileContent] = await file.download();
        const searchIndex = JSON.parse(
          fileContent.toString('utf-8'),
        ) as {
          docs: Array<{
            title: string;
            text: string;
            location: string;
          }>;
        };
        docs = searchIndex.docs || [];
        logger.info(
          `TechDocs Orphan Sweeper: found ${docs.length} pages in index for orphan ${prefix}.`,
        );
      } catch (readError) {
        logger.warn(
          `TechDocs Orphan Sweeper: search_index.json not found or unreadable for orphan ${prefix}. Skipping GDE document purges.`,
        );
      }

      // B. Delete GDE indexed documents
      if (docs.length > 0) {
        try {
          const location = config.getString(
            'search.engines.vertexai.location',
          );
          const projectId = config.getString(
            'search.engines.vertexai.projectId',
          );
          const dataStoreId = config.getString(
            'search.engines.vertexai.dataStoreId',
          );

          const apiEndpoint =
            location !== 'global'
              ? `${location}-discoveryengine.googleapis.com`
              : undefined;

          const docClient = new DocumentServiceClient({ apiEndpoint });
          const parent =
            docClient.projectLocationCollectionDataStoreBranchPath(
              projectId,
              location,
              'default_collection',
              dataStoreId,
              'default_branch',
            );

          for (const doc of docs) {
            if (doc.location) {
              const docId = crypto
                .createHash('md5')
                .update(
                  `${entityNamespace}_${kind}_${name}_${doc.location}`,
                )
                .digest('hex');

              const docPath = `${parent}/documents/${docId}`;
              try {
                await docClient.deleteDocument({ name: docPath });
                logger.info(
                  `TechDocs Orphan Sweeper: purged document ${docId} (location: ${doc.location}) from Vertex AI Search.`,
                );
              } catch (delErr) {
                logger.error(
                  `TechDocs Orphan Sweeper: failed to delete document ${docId}:`,
                  delErr as Error,
                );
              }
            }
          }
        } catch (vertexError) {
          logger.error(
            `TechDocs Orphan Sweeper: GDE client error during document purges:`,
            vertexError as Error,
          );
        }
      }

      // C. WIPE STATIC FILES FROM GCS BUCKET
      try {
        const gcsPrefix = `${prefix}/`;
        logger.info(
          `TechDocs Orphan Sweeper: deleting GCS bucket files under: ${gcsPrefix}`,
        );
        await storage
          .bucket(bucketName!)
          .deleteFiles({ prefix: gcsPrefix });
        logger.info(
          `TechDocs Orphan Sweeper: successfully deleted all GCS files for orphan ${prefix}.`,
        );
      } catch (gcsPurgeError) {
        logger.error(
          `TechDocs Orphan Sweeper: failed to clean GCS files for orphan ${prefix}:`,
          gcsPurgeError as Error,
        );
      }
    }

    logger.info('TechDocs Orphan Sweeper: sweep cycle completed.');
  } catch (error) {
    logger.error(
      'TechDocs Orphan Sweeper: sweep failed with error:',
      error as Error,
    );
  }
}
