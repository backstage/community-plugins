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
import express from 'express';
import {
  RootConfigService,
  LoggerService,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { DefectDojoClient } from './services/defectdojoClient';
import { InputError } from '@backstage/errors';
import { FindingResponse, ProcessedFinding } from './services/types';

export interface RouterOptions {
  config: RootConfigService;
  logger: LoggerService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger, httpAuth } = options;
  const router = express.Router();
  router.use(express.json());

  let client: DefectDojoClient;
  try {
    client = new DefectDojoClient(config);
  } catch (error: any) {
    logger.error('Failed to initialize DefectDojo client', error);
    throw new Error(`DefectDojo configuration error: ${error.message}`);
  }

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  router.get('/v1/products/:identifier', async (req, res): Promise<void> => {
    logger.info('Getting product');
    await httpAuth.credentials(req, { allow: ['user'] });
    const { identifier } = req.params;

    const product = await client.getProduct(
      !isNaN(Number(identifier)) ? Number(identifier) : identifier,
    );
    res.json(product);
  });

  router.get('/v1/engagements', async (req, res): Promise<void> => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const productId = req.query.productId;

    if (!productId) {
      throw new InputError('productId query parameter is required');
    }

    if (!Number.isFinite(Number(productId)) || Number(productId) <= 0) {
      throw new InputError(
        `Invalid product ID: ${productId}. Must be a positive integer.`,
      );
    }

    const engagements = await client.getEngagements(Number(productId));
    res.json({ engagements });
  });

  router.get('/v1/findings', async (req, res): Promise<void> => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const productIdParam = req.query.productId;
    const engagementIdParam = req.query.engagementId;
    const limitParam = req.query.limit;
    const offsetParam = req.query.offset;

    if (!productIdParam) {
      throw new InputError('productId query parameter is required');
    }

    const productId = Number(productIdParam);
    if (!Number.isFinite(productId) || productId <= 0) {
      logger.warn(
        `Invalid request to /v1/findings: productId=${productIdParam}`,
      );
      throw new InputError(
        `Invalid product ID: ${productIdParam}. Must be a positive integer.`,
      );
    }

    let engagementId: number | undefined;
    if (engagementIdParam) {
      engagementId = Number(engagementIdParam);
      if (!Number.isFinite(engagementId) || engagementId <= 0) {
        throw new InputError(
          `Invalid engagement ID: ${engagementIdParam}. Must be a positive integer.`,
        );
      }
    }

    // Parse pagination parameters
    const limit = limitParam ? Number(limitParam) : undefined;
    const offset = offsetParam ? Number(offsetParam) : undefined;

    if (limit !== undefined && (!Number.isFinite(limit) || limit <= 0)) {
      throw new InputError(
        `Invalid limit: ${limitParam}. Must be a positive integer.`,
      );
    }

    if (offset !== undefined && (!Number.isFinite(offset) || offset < 0)) {
      throw new InputError(
        `Invalid offset: ${offsetParam}. Must be a non-negative integer.`,
      );
    }

    const started = Date.now();
    const logMessage = engagementId
      ? `Fetching DefectDojo findings for engagement ${engagementId}`
      : `Fetching DefectDojo findings for product ${productId}`;
    logger.info(logMessage);

    const response = await client.listFindingsByProduct(
      productId,
      engagementId,
      { limit, offset },
    );

    const payload: FindingResponse = {
      total: response.count,
      findings: response.results.map(
        (f): ProcessedFinding => ({
          id: f.id,
          title: f.title,
          severity: f.severity ?? 'Unknown',
          url: f.url,
          description: f.description ?? 'N/A',
          cwe: f.cwe ?? 0,
          product: f.product ?? 'N/A',
          engagement: f.engagement ?? 'N/A',
          created: f.created,
        }),
      ),
      tookMs: Date.now() - started,
      next: response.next,
      previous: response.previous,
    };

    const successMessage = engagementId
      ? `Successfully retrieved ${
          response.results.length
        } findings for engagement ${engagementId} in ${Date.now() - started}ms`
      : `Successfully retrieved ${
          response.results.length
        } findings for product ${productId} in ${Date.now() - started}ms`;
    logger.info(successMessage);
    res.json(payload);
  });

  return router;
}
