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
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { Storage } from '@google-cloud/storage';
import { DocumentServiceClient } from '@google-cloud/discoveryengine';
import { OAuth2Client } from 'google-auth-library';
import express from 'express';
import crypto from 'crypto';

const CE_TYPE_OBJECT_FINALIZED = 'google.cloud.storage.object.v1.finalized';
const authClient = new OAuth2Client();

/**
 * Backend module extending the events plugin with GCS Eventarc webhook support.
 *
 * @public
 */
export const eventsModuleGcsEventarcWebhook = createBackendModule({
  pluginId: 'events', // Extending the events plugin
  moduleId: 'gcs-eventarc-webhook',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        events: eventsServiceRef,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, events, logger, config }) {
        const router = express.Router();

        // Exempt /gcs endpoint from Backstage's default backend auth policy
        // Cryptographic token validation is handled internally via Google OIDC
        httpRouter.addAuthPolicy({
          path: '/gcs',
          allow: 'unauthenticated',
        });

        const storage = new Storage();

        /**
         * Retrieves and parses search_index.json from GCS using closure-scoped storage and logger.
         */
        async function getDocs(
          bucketName: string,
          blobName: string,
          generation: number,
        ): Promise<Array<{ title: string; text: string; location: string }>> {
          try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(blobName, {
              generation: generation.toString(),
            });

            const [fileContent] = await file.download();
            const searchIndex = JSON.parse(fileContent.toString('utf-8')) as {
              docs: Array<{ title: string; text: string; location: string }>;
            };

            return searchIndex.docs || [];
          } catch (error) {
            logger.error(
              `Failed to fetch or parse index file from GCS:`,
              error as Error,
            );
            return [];
          }
        }

        /**
         * Retrieves the generation ID of the immediately previous version of a GCS blob.
         */
        async function getPreviousGeneration(
          bucketName: string,
          blobName: string,
        ): Promise<number | null> {
          try {
            const [files] = await storage.bucket(bucketName).getFiles({
              prefix: blobName,
              versions: true,
            });

            const generations = files
              .filter(f => f.name === blobName && f.generation)
              .map(f => Number(f.generation))
              .sort((a, b) => b - a);

            if (generations.length < 2) {
              return null;
            }
            return generations[1]; // Second element is the immediately previous version
          } catch (error) {
            logger.warn(
              `Failed to retrieve previous GCS generation for blob ${blobName}:`,
              error as Error,
            );
            return null;
          }
        }

        // 1. MOUNT WEBHOOK INGRESS: Receives Eventarc finalize notifications (Secured via OIDC)
        router.post('/gcs', express.json(), async (req, res) => {
          const oidcConfig = config.getOptionalConfig(
            'events.modules.gcsEventarcWebhook.oidc',
          );

          // If OIDC is configured, verify the incoming Google ID Token
          if (oidcConfig?.getOptionalBoolean('enabled')) {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              logger.warn(
                'Unauthorized Eventarc webhook: Missing Bearer token.',
              );
              res.status(401).send('Unauthorized: Missing Token');
              return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            const audience = oidcConfig.getString('audience');
            const expectedEmail = oidcConfig.getOptionalString(
              'serviceAccountEmail',
            );

            try {
              const ticket = await authClient.verifyIdToken({
                idToken,
                audience,
              });
              const payload = ticket.getPayload();

              if (!payload) {
                logger.warn(
                  'Unauthorized Eventarc webhook: Empty token payload.',
                );
                res.status(401).send('Unauthorized: Empty Payload');
                return;
              }

              // Verify issuer is Google
              if (payload.iss !== 'https://accounts.google.com') {
                logger.warn(
                  `Unauthorized Eventarc webhook: Invalid issuer ${payload.iss}`,
                );
                res.status(401).send('Unauthorized: Invalid Issuer');
                return;
              }

              // Verify triggering service account email if configured
              if (expectedEmail && payload.email !== expectedEmail) {
                logger.warn(
                  `Unauthorized Eventarc webhook: SA email mismatch. Expected ${expectedEmail}, got ${payload.email}`,
                );
                res.status(401).send('Unauthorized: Service Account Mismatch');
                return;
              }

              logger.debug(
                `Eventarc OIDC token verified for trigger SA: ${payload.email}`,
              );
            } catch (authError) {
              logger.error(
                'Unauthorized Eventarc webhook: ID Token verification failed:',
                authError as Error,
              );
              res.status(401).send('Unauthorized: Token Verification Failed');
              return;
            }
          }

          const eventType = req.headers['ce-type'] as string;
          const gcsData = req.body as {
            bucket: string;
            name: string;
            generation: number;
          };

          logger.info(
            `Received Eventarc webhook: "${eventType}" for file: "${gcsData.name}"`,
          );

          if (eventType === CE_TYPE_OBJECT_FINALIZED) {
            // Publish finalized event to internal bus
            await events.publish({
              topic: 'gcs-notifications',
              eventPayload: gcsData,
            });
          }

          res.status(200).send('Event processed successfully');
        });

        // Mount under /api/events/gcs
        httpRouter.use(router as any);

        // 2. SUBSCRIBE & PROCESS WEBHOOK EVENTS
        events.subscribe({
          id: 'gcs-eventarc-webhook',
          topics: ['gcs-notifications'],
          onEvent: async (event: any) => {
            const gcsData = event.eventPayload as {
              bucket: string;
              name: string;
              generation: number;
            };

            // Standard TechDocs build publishes a unified search_index.json file
            if (gcsData.name.endsWith('/search_index.json')) {
              logger.info(
                `Starting search-index synchronization for: ${gcsData.name}`,
              );

              const pathParts = gcsData.name.split('/');
              if (pathParts.length < 3) {
                logger.error(`Unexpected GCS path format: ${gcsData.name}`);
                return;
              }
              const namespace = pathParts[0];
              const kind = pathParts[1];
              const name = pathParts[2];

              try {
                // A. Download and Parse new search_index.json
                const docs = await getDocs(
                  gcsData.bucket,
                  gcsData.name,
                  gcsData.generation,
                );

                if (docs.length === 0) {
                  logger.info(`No documents to process for: ${gcsData.name}`);
                  return;
                }

                // B. Initialize Google Discovery Engine Clients
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

                // C. Map new documents and generate stable MD5 IDs
                const documents = docs
                  .filter(doc => doc.title && doc.text && doc.location)
                  .map(doc => {
                    const docId = crypto
                      .createHash('md5')
                      .update(`${namespace}_${kind}_${name}_${doc.location}`)
                      .digest('hex');

                    return {
                      id: docId,
                      jsonData: JSON.stringify({
                        id: docId,
                        title: doc.title,
                        name: name,
                        namespace: namespace,
                        kind: kind,
                        location: doc.location,
                        text: doc.text,
                      }),
                    };
                  });

                // D. Import new documents in bulk using INCREMENTAL reconciliation
                logger.info(
                  `Ingesting ${documents.length} documents into dataStore: ${dataStoreId}...`,
                );
                const response = await docClient.importDocuments({
                  parent,
                  inlineSource: {
                    documents: documents as any,
                  },
                  reconciliationMode: 'INCREMENTAL',
                } as any);

                const operation = response[0] as any;
                await operation.promise();
                logger.info(`Bulk document ingestion completed.`);

                // E. Delta-reconciliation: compare with previous generation to delete stale documents
                const previousGeneration = await getPreviousGeneration(
                  gcsData.bucket,
                  gcsData.name,
                );

                const idsToDelete: string[] = [];

                if (previousGeneration) {
                  logger.info(
                    `Comparing changes with previous GCS generation: ${previousGeneration}`,
                  );
                  const previousDocs = await getDocs(
                    gcsData.bucket,
                    gcsData.name,
                    previousGeneration,
                  );

                  const currentDocIds = new Set(documents.map(d => d.id));

                  for (const prevDoc of previousDocs) {
                    if (prevDoc.title && prevDoc.text && prevDoc.location) {
                      const prevId = crypto
                        .createHash('md5')
                        .update(
                          `${namespace}_${kind}_${name}_${prevDoc.location}`,
                        )
                        .digest('hex');

                      if (!currentDocIds.has(prevId)) {
                        idsToDelete.push(prevId);
                      }
                    }
                  }
                }

                // F. Execute purge operations for stale/deleted nodes
                if (idsToDelete.length > 0) {
                  logger.info(
                    `Purging ${idsToDelete.length} stale documents from index...`,
                  );
                  for (const docId of idsToDelete) {
                    const docPath = `${parent}/documents/${docId}`;
                    try {
                      await docClient.deleteDocument({ name: docPath });
                      logger.debug(`Deleted stale search document: ${docId}`);
                    } catch (delError) {
                      logger.error(
                        `Failed to delete search document ${docId}:`,
                        delError as Error,
                      );
                    }
                  }
                  logger.info(`Delta cleanup finished.`);
                }

                logger.info(
                  `Successfully synchronized search index for ${kind}:${namespace}/${name}`,
                );
              } catch (error) {
                logger.error(
                  `Failed to synchronize search documents for ${name}`,
                  error as Error,
                );
              }
            }
          },
        });
      },
    });
  },
});

export default eventsModuleGcsEventarcWebhook;
