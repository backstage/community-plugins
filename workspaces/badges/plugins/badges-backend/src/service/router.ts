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
import { CatalogApi, CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { NotFoundError } from '@backstage/errors';
import { BadgeBuilder, DefaultBadgeBuilder } from '../lib/BadgeBuilder';
import {
  BADGE_STYLES,
  BadgeContext,
  BadgeFactories,
  BadgeStyle,
} from '../types';
import { isNil } from 'lodash';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { BadgesStore, DatabaseBadgesStore } from '../database/badgesStore';
import { createDefaultBadgeFactories } from '../badges';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

/** @internal */
interface RouterOptions {
  badgeBuilder?: BadgeBuilder;
  badgeFactories?: BadgeFactories;
  catalog?: CatalogApi;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  identity?: IdentityApi;
  badgeStore?: BadgesStore;
  database: DatabaseService;
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const catalog =
    options.catalog || new CatalogClient({ discoveryApi: options.discovery });
  const badgeBuilder =
    options.badgeBuilder ||
    new DefaultBadgeBuilder(
      options.badgeFactories || createDefaultBadgeFactories(),
    );
  const router = Router();

  const { config, logger, discovery, auth, httpAuth, database } = options;
  const baseUrl = await discovery.getExternalBaseUrl('badges');

  if (config.getOptionalBoolean('app.badges.obfuscate')) {
    return obfuscatedRoute(
      router,
      catalog,
      badgeBuilder,
      logger,
      options,
      config,
      baseUrl,
      auth,
      httpAuth,
      database,
    );
  }
  return nonObfuscatedRoute(
    router,
    catalog,
    badgeBuilder,
    config,
    baseUrl,
    auth,
    logger,
  );
}

async function obfuscatedRoute(
  router: express.Router,
  catalog: CatalogApi,
  badgeBuilder: BadgeBuilder,
  logger: LoggerService,
  options: RouterOptions,
  config: Config,
  baseUrl: string,
  auth: AuthService,
  httpAuth: HttpAuthService,
  database: DatabaseService,
) {
  logger.info('Badges obfuscation is enabled');

  const store = options.badgeStore
    ? options.badgeStore
    : await DatabaseBadgesStore.create({
        database,
      });

  router.get('/entity/:entityUuid/badge-specs', async (req, res) => {
    const { entityUuid } = req.params;

    // Retrieve the badge info from the database
    const badgeInfos = await store.getBadgeFromUuid(entityUuid);

    if (isNil(badgeInfos)) {
      throw new NotFoundError(`No badge found for entity uuid "${entityUuid}"`);
    }

    // If a mapping is found, map name, namespace and kind
    const name = badgeInfos.name;
    const namespace = badgeInfos.namespace;
    const kind = badgeInfos.kind;
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    // Query the catalog with the name, namespace, kind to get the entity information
    const entity = await catalog.getEntityByRef(
      { namespace, kind, name },
      { token },
    );

    if (isNil(entity)) {
      throw new NotFoundError(
        `No ${kind} entity in ${namespace} named "${name}"`,
      );
    }

    const bsOptions = parseBadgeStyleOptions(req.query);

    // Create the badge specs
    const specs = [];
    for (const badgeInfo of await badgeBuilder.getBadges()) {
      const context: BadgeContext = {
        badgeUrl: `${baseUrl}/entity/${entityUuid}/${
          badgeInfo.id
        }${buildBadgeStyleOptionsQuery(bsOptions)}`,
        config: config,
        entity,
        style: bsOptions.style,
        color: bsOptions.style,
      };

      const badge = await badgeBuilder.createBadgeJson({
        badgeInfo,
        context,
      });
      specs.push(badge);
    }

    res.status(200).json(specs);
  });

  router.get('/entity/:entityUuid/:badgeId', async (req, res) => {
    const { entityUuid, badgeId } = req.params;

    // Retrieve the badge info from the database
    const badgeInfo = await store.getBadgeFromUuid(entityUuid);

    if (isNil(badgeInfo)) {
      throw new NotFoundError(`No badge found for entity uuid "${entityUuid}"`);
    }

    // If a mapping is found, map name, namespace and kind
    const name = badgeInfo.name;
    const namespace = badgeInfo.namespace;
    const kind = badgeInfo.kind;

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const entity = await catalog.getEntityByRef(
      { namespace, kind, name },
      { token },
    );
    if (isNil(entity)) {
      throw new NotFoundError(
        `No ${kind} entity in ${namespace} named "${name}"`,
        res.sendStatus(404),
      );
    }

    let format =
      req.accepts(['image/svg+xml', 'application/json']) || 'image/svg+xml';
    if (req.query.format === 'json') {
      format = 'application/json';
    }

    const bsOptions = parseBadgeStyleOptions(req.query);

    const badgeOptions = {
      badgeInfo: { id: badgeId },
      context: {
        badgeUrl: `${baseUrl}/entity/${entityUuid}/${badgeId}${buildBadgeStyleOptionsQuery(
          bsOptions,
        )}`,
        config: config,
        entity,
        style: bsOptions.style,
        color: bsOptions.color,
      },
    };

    let data: string;
    if (format === 'application/json') {
      data = JSON.stringify(
        await badgeBuilder.createBadgeJson(badgeOptions),
        null,
        2,
      );
    } else {
      data = await badgeBuilder.createBadgeSvg(badgeOptions);
    }

    res.setHeader('Content-Type', format);
    res.status(200).send(data);
  });

  router.get(
    '/entity/:namespace/:kind/:name/obfuscated',
    async function authenticate(req, _res, next) {
      const { kind, namespace, name } = req.params;

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await httpAuth.credentials(req),
        targetPluginId: 'catalog',
      });

      // check that the user has the correct permissions
      // to view the catalog entity by forwarding the token
      const entity = await catalog.getEntityByRef(
        { kind, namespace, name },
        { token },
      );

      if (!entity) {
        throw new NotFoundError(
          `No ${kind} entity in ${namespace} named "${name}"`,
        );
      } else {
        next();
      }
    },
    async (req, res) => {
      const { namespace, kind, name } = req.params;
      const storedEntityUuid: { uuid: string } | undefined =
        await store.getBadgeUuid(name, namespace, kind);

      if (isNil(storedEntityUuid)) {
        throw new NotFoundError(
          `No uuid found for entity "${namespace}/${kind}/${name}"`,
        );
      }

      return res.status(200).json(storedEntityUuid);
    },
  );

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}

async function nonObfuscatedRoute(
  router: express.Router,
  catalog: CatalogApi,
  badgeBuilder: BadgeBuilder,
  config: Config,
  baseUrl: string,
  auth: AuthService,
  logger: LoggerService,
) {
  router.get('/entity/:namespace/:kind/:name/badge-specs', async (req, res) => {
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const { namespace, kind, name } = req.params;
    const entity = await catalog.getEntityByRef(
      { namespace, kind, name },
      { token },
    );
    if (!entity) {
      throw new NotFoundError(
        `No ${kind} entity in ${namespace} named "${name}"`,
      );
    }

    const bsOptions = parseBadgeStyleOptions(req.query);

    const specs = [];
    for (const badgeInfo of await badgeBuilder.getBadges()) {
      const badgeId = badgeInfo.id;
      const context: BadgeContext = {
        badgeUrl: `${baseUrl}/entity/${namespace}/${kind}/${name}/badge/${badgeId}${buildBadgeStyleOptionsQuery(
          bsOptions,
        )}`,
        config: config,
        entity,
        style: bsOptions.style,
        color: bsOptions.color,
      };

      const badge = await badgeBuilder.createBadgeJson({
        badgeInfo,
        context,
      });
      specs.push(badge);
    }

    res.status(200).json(specs);
  });

  router.get(
    '/entity/:namespace/:kind/:name/badge/:badgeId',
    async (req, res) => {
      const { namespace, kind, name, badgeId } = req.params;
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });

      const entity = await catalog.getEntityByRef(
        { namespace, kind, name },
        { token },
      );

      if (!entity) {
        throw new NotFoundError(
          `No ${kind} entity in ${namespace} named "${name}"`,
        );
      }

      let format =
        req.accepts(['image/svg+xml', 'application/json']) || 'image/svg+xml';
      if (req.query.format === 'json') {
        format = 'application/json';
      }

      const bsOptions = parseBadgeStyleOptions(req.query);

      const badgeOptions = {
        badgeInfo: { id: badgeId },
        context: {
          badgeUrl: `${baseUrl}/entity/${namespace}/${kind}/${name}/badge/${badgeId}${buildBadgeStyleOptionsQuery(
            bsOptions,
          )}`,
          config: config,
          entity,
          style: bsOptions.style,
          color: bsOptions.color,
        },
      };

      let data: string;
      if (format === 'application/json') {
        data = JSON.stringify(
          await badgeBuilder.createBadgeJson(badgeOptions),
          null,
          2,
        );
      } else {
        data = await badgeBuilder.createBadgeSvg(badgeOptions);
      }

      res.setHeader('Content-Type', format);
      res.status(200).send(data);
    },
  );

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}

interface BadgeStyleOptions {
  style?: BadgeStyle;
  color?: string;
}

// Parse common badge style options from query parameters.
//
// This function will parse the following query parameters:
// - `style`: One of the supported badge styles.
// - `color`: A custom color for the badge message.
function parseBadgeStyleOptions(query: qs.ParsedQs): BadgeStyleOptions {
  let style: BadgeStyle | undefined = undefined;
  let color: string | undefined = undefined;

  if (
    typeof query.style === 'string' &&
    BADGE_STYLES.includes(query.style as any)
  ) {
    style = query.style as BadgeStyle;
  }

  if (typeof query.color === 'string') {
    color = query.color;
  }

  return { style, color };
}

// Build a query string including explanation mark if there are any options.
function buildBadgeStyleOptionsQuery({
  style,
  color,
}: BadgeStyleOptions): string {
  const query: string[] = [];

  if (style) {
    query.push(`style=${style}`);
  }

  if (color) {
    query.push(`color=${color}`);
  }

  return query.length > 0 ? `?${query.join('&')}` : '';
}
