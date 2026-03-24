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
  createPermissionResourceRef,
  createPermissionRule,
} from '@backstage/plugin-permission-node';
import {
  PLAYLIST_LIST_RESOURCE_TYPE,
  PlaylistMetadata,
} from '@backstage-community/plugin-playlist-common';
import { z } from 'zod/v3';

import { ListPlaylistsFilter } from '../service';

const playlistListResourceRef = createPermissionResourceRef<
  PlaylistMetadata,
  ListPlaylistsFilter
>().with({
  pluginId: 'playlist',
  resourceType: PLAYLIST_LIST_RESOURCE_TYPE,
});

const isOwner = createPermissionRule({
  name: 'IS_OWNER',
  description: 'Allow playlists owned by the given entity refs',
  resourceRef: playlistListResourceRef,
  paramsSchema: z.object({
    owners: z.array(z.string()).describe('List of entity refs to match on'),
  }),
  apply: (list: PlaylistMetadata, { owners }) => owners.includes(list.owner),
  toQuery: ({ owners }) => ({
    key: 'owner',
    values: owners,
  }),
});

const isPublic = createPermissionRule({
  name: 'IS_PUBLIC',
  description: 'Allow playlists that are set as public',
  resourceRef: playlistListResourceRef,
  apply: (list: PlaylistMetadata) => list.public,
  toQuery: () => ({ key: 'public', values: [true] }),
});

/**
 * @public
 */
export const rules = { isOwner, isPublic };
