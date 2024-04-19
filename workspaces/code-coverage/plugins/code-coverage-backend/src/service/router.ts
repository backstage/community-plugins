/*
 * Copyright 2021 The Backstage Authors
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
import Router from 'express-promise-router';
import BodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
import { CatalogApi, CatalogClient } from '@backstage/catalog-client';
import {
  createLegacyAuthAdapters,
  errorHandler,
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  UrlReader,
} from '@backstage/backend-common';
import { InputError, NotFoundError } from '@backstage/errors';
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { CodeCoverageDatabase } from './CodeCoverageDatabase';
import { aggregateCoverage, CoverageUtils } from './CoverageUtils';
import { Cobertura, Converter, Jacoco, Lcov } from './converter';
import { getEntitySourceLocation } from '@backstage/catalog-model';
import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';

/**
 * Options for {@link createRouter}.
 *
 * @public
 */
export interface RouterOptions {
  config: Config;
  discovery: PluginEndpointDiscovery;
  database: PluginDatabaseManager;
  urlReader: UrlReader;
  logger: LoggerService;
  catalogApi?: CatalogApi;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
}

export interface CodeCoverageApi {
  name: string;
}

export const makeRouter = async (
  options: RouterOptions,
): Promise<express.Router> => {
  const { config, logger, discovery, database, urlReader } = options;

  const codeCoverageDatabase = await CodeCoverageDatabase.create(database);
  const codecovUrl = await discovery.getExternalBaseUrl('code-coverage');
  const catalogApi =
    options.catalogApi ?? new CatalogClient({ discoveryApi: discovery });
  const scm = ScmIntegrations.fromConfig(config);
  const { auth, httpAuth } = createLegacyAuthAdapters(options);

  const bodySizeLimit =
    config.getOptionalString('codeCoverage.bodySizeLimit') ?? '100kb';

  bodyParserXml(BodyParser);
  const router = Router();
  router.use(
    BodyParser.xml({
      limit: bodySizeLimit,
    }),
  );
  router.use(
    BodyParser.text({
      limit: bodySizeLimit,
    }),
  );
  router.use(express.json());

  const utils = new CoverageUtils(scm, urlReader);

  router.get('/health', async (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  /**
   * /report?entity=component:default/mycomponent
   */
  router.get('/report', async (req, res) => {
    const { entity } = req.query;
    const entityLookup = await catalogApi.getEntityByRef(
      entity as string,
      await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(req),
        targetPluginId: 'catalog',
      }),
    );
    if (!entityLookup) {
      throw new NotFoundError(`No entity found matching ${entity}`);
    }
    const stored = await codeCoverageDatabase.getCodeCoverage(entity as string);

    const aggregate = aggregateCoverage(stored);

    res.status(200).json({
      ...stored,
      aggregate: {
        line: aggregate.line,
        branch: aggregate.branch,
      },
    });
  });

  /**
   * /history?entity=component:default/mycomponent
   */
  router.get('/history', async (req, res) => {
    const { entity } = req.query;
    const entityLookup = await catalogApi.getEntityByRef(
      entity as string,
      await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(req),
        targetPluginId: 'catalog',
      }),
    );
    if (!entityLookup) {
      throw new NotFoundError(`No entity found matching ${entity}`);
    }
    const { limit } = req.query;
    const history = await codeCoverageDatabase.getHistory(
      entity as string,
      parseInt(limit?.toString() || '10', 10),
    );

    res.status(200).json(history);
  });

  /**
   * /file-content?entity=component:default/mycomponent&path=src/some-file.go
   */
  router.get('/file-content', async (req, res) => {
    const { entity, path } = req.query;
    const entityLookup = await catalogApi.getEntityByRef(
      entity as string,
      await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(req),
        targetPluginId: 'catalog',
      }),
    );
    if (!entityLookup) {
      throw new NotFoundError(`No entity found matching ${entity}`);
    }

    if (!path) {
      throw new InputError('Need path query parameter');
    }

    const sourceLocation = getEntitySourceLocation(entityLookup);

    if (!sourceLocation) {
      throw new InputError(
        `No "backstage.io/source-location" annotation on entity ${entity}`,
      );
    }

    const vcs = scm.byUrl(sourceLocation.target);
    if (!vcs) {
      throw new InputError(`Unable to determine SCM from ${sourceLocation}`);
    }

    const scmTree = await urlReader.readTree(sourceLocation.target);
    const scmFile = (await scmTree.files()).find(f => f.path === path);
    if (!scmFile) {
      res.status(404).json({
        message: "Couldn't find file in SCM",
        file: path,
        scm: vcs.title,
      });
      return;
    }
    const content = await scmFile?.content();
    if (!content) {
      res.status(400).json({
        message: "Couldn't process content of file in SCM",
        file: path,
        scm: vcs.title,
      });
      return;
    }

    const data = content.toString();
    res.status(200).contentType('text/plain').send(data);
  });

  /**
   * /report?entity=component:default/mycomponent&coverageType=cobertura
   */
  router.post('/report', async (req, res) => {
    const { entity: entityRef, coverageType } = req.query;
    const entity = await catalogApi.getEntityByRef(
      entityRef as string,
      await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(req),
        targetPluginId: 'catalog',
      }),
    );
    if (!entity) {
      throw new NotFoundError(`No entity found matching ${entityRef}`);
    }

    let converter: Converter;
    if (!coverageType) {
      throw new InputError('Need coverageType query parameter');
    } else if (coverageType === 'jacoco') {
      converter = new Jacoco(logger);
    } else if (coverageType === 'cobertura') {
      converter = new Cobertura(logger);
    } else if (coverageType === 'lcov') {
      converter = new Lcov(logger);
    } else {
      throw new InputError(`Unsupported coverage type '${coverageType}`);
    }

    const { sourceLocation, vcs, scmFiles, body } =
      await utils.processCoveragePayload(entity, req);

    const files = converter.convert(body, scmFiles);
    if (!files || files.length === 0) {
      throw new InputError(`Unable to parse body as ${coverageType}`);
    }

    const coverage = await utils.buildCoverage(
      entity,
      sourceLocation,
      vcs,
      files,
    );
    await codeCoverageDatabase.insertCodeCoverage(coverage);

    res.status(201).json({
      links: [
        {
          rel: 'coverage',
          href: `${codecovUrl}/report?entity=${entityRef}`,
        },
      ],
    });
  });

  router.use(errorHandler());
  return router;
};

/**
 * Creates a code-coverage plugin backend router.
 *
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const logger = options.logger;

  logger.info('Initializing Code Coverage backend');

  return makeRouter(options);
}
