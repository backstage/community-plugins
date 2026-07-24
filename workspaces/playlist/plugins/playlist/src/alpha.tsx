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
  ApiBlueprint,
  createFrontendPlugin,
  PageBlueprint,
  dialogApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import { playlistApiRef, PlaylistClient } from './api';
import { EntityPlaylistDialog } from './components/EntityPlaylistDialog';
import { useTitle } from './hooks';
import { playlistRouteRef, rootRouteRef } from './routes';

const playlistApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: playlistApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new PlaylistClient({ discoveryApi, fetchApi }),
    }),
});

const playlistIndexPage = PageBlueprint.make({
  params: {
    path: '/playlist',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/PlaylistIndexPage').then(m => (
        <m.NfsDefaultPlaylistIndexPage />
      )),
  },
});

const playlistDetailPage = PageBlueprint.make({
  name: 'playlist-detail',
  params: {
    path: '/playlist/:playlistId',
    routeRef: playlistRouteRef,
    loader: () =>
      import('./components/PlaylistPage').then(m => <m.NfsPlaylistPage />),
  },
});

const addToPlaylistContextMenuItem = EntityContextMenuItemBlueprint.make({
  name: 'add-to-playlist',
  params: {
    icon: <PlaylistAddIcon />,
    useProps: () => {
      const dialogApi = useApi(dialogApiRef);
      const { entity } = useAsyncEntity();
      const singularTitleLowerCase = useTitle({
        pluralize: false,
        lowerCase: true,
      });
      return {
        title: `Add to ${singularTitleLowerCase}`,
        onClick: () => {
          dialogApi.open(({ dialog }) => (
            <EntityPlaylistDialog
              open
              onClose={() => dialog.close()}
              entity={entity}
            />
          ));
        },
      };
    },
  },
});

export default createFrontendPlugin({
  pluginId: 'playlist',
  title: 'Playlists',
  icon: <PlaylistPlayIcon fontSize="inherit" />,
  extensions: [
    playlistApi,
    playlistIndexPage,
    playlistDetailPage,
    addToPlaylistContextMenuItem,
  ],
  routes: {
    root: rootRouteRef,
    playlist: playlistRouteRef,
  },
});
