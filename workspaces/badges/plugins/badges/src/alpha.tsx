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
  configApiRef,
  createFrontendPlugin,
  dialogApiRef,
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import {
  EntityProvider,
  useAsyncEntity,
} from '@backstage/plugin-catalog-react';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { RiShieldCheckLine } from '@remixicon/react';
import { badgesApiRef, BadgesClient } from './api';
import { EntityBadgesDialog } from './components/EntityBadgesDialog';

/** @alpha */
export const badgesApiExtension = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: badgesApiRef,
      deps: {
        fetchApi: fetchApiRef,
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ fetchApi, discoveryApi, configApi }) =>
        new BadgesClient({ fetchApi, discoveryApi, configApi }),
    }),
});

/** @alpha */
export const badgesEntityContextMenuItem = EntityContextMenuItemBlueprint.make({
  name: 'badges',
  params: {
    icon: <RiShieldCheckLine />,
    useProps: () => {
      const dialogApi = useApi(dialogApiRef);
      const { entity } = useAsyncEntity();
      return {
        title: 'Badges',
        onClick: () => {
          dialogApi.open(({ dialog }) => (
            <EntityProvider entity={entity}>
              <EntityBadgesDialog open onClose={() => dialog.close()} />
            </EntityProvider>
          ));
        },
      };
    },
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'badges',
  extensions: [badgesApiExtension, badgesEntityContextMenuItem],
});
