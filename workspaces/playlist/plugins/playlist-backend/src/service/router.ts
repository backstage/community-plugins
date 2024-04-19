/*
 * Copyright 2022 The Backstage Authors
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
  createLegacyAuthAdapters,
  errorHandler,
  PluginDatabaseManager,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';
import { NotAllowedError } from '@backstage/errors';
import { IdentityApi } from '@backstage/plugin-auth-node';
import {
  AuthorizePermissionRequest,
  AuthorizeResult,
  QueryPermissionRequest,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  permissions,
  PLAYLIST_LIST_RESOURCE_TYPE,
} from '@backstage-community/plugin-playlist-common';
import express from 'express';
import Router from 'express-promise-router';

import { rules, transformConditions } from '../permissions';
import { DatabaseHandler } from './DatabaseHandler';
import { parseListPlaylistsFilterParams } from './ListPlaylistsFilter';
import {
  AuthService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

/**
 * @public
 */
export interface RouterOptions {
  database: PluginDatabaseManager;
  discovery: PluginEndpointDiscovery;
  identity: IdentityApi;
  logger: LoggerService;
  permissions: PermissionsService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
}

/**
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    database,
    discovery,
    logger,
    permissions: permissionEvaluator,
  } = options;

  const { auth, httpAuth } = createLegacyAuthAdapters(options);

  logger.info('Initializing Playlist backend');

  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  const db = await database.getClient();
  const dbHandler = await DatabaseHandler.create({ database: db });

  const evaluateRequestPermission = async (
    request: express.Request,
    permission: AuthorizePermissionRequest | QueryPermissionRequest,
    conditional: boolean = false,
  ) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });

    const decision = conditional
      ? (
          await permissionEvaluator.authorizeConditional(
            [permission as QueryPermissionRequest],
            { credentials },
          )
        )[0]
      : (
          await permissionEvaluator.authorize(
            [permission as AuthorizePermissionRequest],
            { credentials },
          )
        )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    return { decision, user: credentials.principal };
  };

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: Object.values(permissions),
    getResources: resourceRefs =>
      Promise.all(resourceRefs.map(ref => dbHandler.getPlaylist(ref))),
    resourceType: PLAYLIST_LIST_RESOURCE_TYPE,
    rules: Object.values(rules),
  });

  const router = Router();
  router.use(express.json());
  router.use(permissionIntegrationRouter);

  router.get('/', async (req, res) => {
    const { decision, user } = await evaluateRequestPermission(
      req,
      { permission: permissions.playlistListRead },
      true,
    );

    let filter = parseListPlaylistsFilterParams(req.query);
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      const conditionsFilter = transformConditions(decision.conditions);
      filter = filter
        ? { allOf: [filter, conditionsFilter] }
        : conditionsFilter;
    }

    if (req.query.editable) {
      const { decision: updatePermissionDecision } =
        await evaluateRequestPermission(
          req,
          { permission: permissions.playlistListUpdate },
          true,
        );

      if (updatePermissionDecision.result === AuthorizeResult.CONDITIONAL) {
        const updateConditionsFilter = transformConditions(
          updatePermissionDecision.conditions,
        );
        filter = filter
          ? { allOf: [filter, updateConditionsFilter] }
          : updateConditionsFilter;
      }
    }

    const playlists = await dbHandler.listPlaylists(user, filter);
    res.json(playlists);
  });

  router.post('/', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListCreate,
    });
    const playlistId = await dbHandler.createPlaylist(req.body);
    res.status(201).json(playlistId);
  });

  router.get('/:playlistId', async (req, res) => {
    const { user } = await evaluateRequestPermission(req, {
      permission: permissions.playlistListRead,
      resourceRef: req.params.playlistId,
    });
    const playlist = await dbHandler.getPlaylist(req.params.playlistId, user);
    res.json(playlist);
  });

  router.put('/:playlistId', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListUpdate,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.updatePlaylist({ ...req.body, id: req.params.playlistId });
    res.status(200).end();
  });

  router.delete('/:playlistId', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListDelete,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.deletePlaylist(req.params.playlistId);
    res.status(200).end();
  });

  router.post('/:playlistId/entities', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListUpdate,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.addPlaylistEntities(req.params.playlistId, req.body);
    res.status(200).end();
  });

  router.get('/:playlistId/entities', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListRead,
      resourceRef: req.params.playlistId,
    });

    const entityRefs = await dbHandler.getPlaylistEntities(
      req.params.playlistId,
    );
    if (!entityRefs.length) {
      res.json([]);
      return;
    }

    const filter = entityRefs.map(ref => {
      const compoundRef = parseEntityRef(ref);
      return {
        kind: compoundRef.kind,
        'metadata.namespace': compoundRef.namespace,
        'metadata.name': compoundRef.name,
      };
    });

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await httpAuth.credentials(req),
      targetPluginId: 'catalog',
    });

    // TODO(kuangp): entities in this playlist that no longer exist in the catalog will be
    // excluded from this response, we need a way to clean up these orphaned refs potentially
    // via catalog events (https://github.com/backstage/backstage/issues/8219)
    //
    // Note: This will also enforce catalog permissions and will only return entities for which the current user has access to
    const entities = (await catalogClient.getEntities({ filter }, { token }))
      .items;

    res.json(entities);
  });

  router.delete('/:playlistId/entities', async (req, res) => {
    await evaluateRequestPermission(req, {
      permission: permissions.playlistListUpdate,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.removePlaylistEntities(req.params.playlistId, req.body);
    res.status(200).end();
  });

  router.post('/:playlistId/followers', async (req, res) => {
    const { user } = await evaluateRequestPermission(req, {
      permission: permissions.playlistFollowersUpdate,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.followPlaylist(req.params.playlistId, user);
    res.status(200).end();
  });

  router.delete('/:playlistId/followers', async (req, res) => {
    const { user } = await evaluateRequestPermission(req, {
      permission: permissions.playlistFollowersUpdate,
      resourceRef: req.params.playlistId,
    });
    await dbHandler.unfollowPlaylist(req.params.playlistId, user);
    res.status(200).end();
  });

  router.use(errorHandler());
  return router;
}
