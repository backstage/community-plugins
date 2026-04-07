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
  configApiRef,
  createFrontendPlugin,
  dialogApiRef,
  discoveryApiRef,
  fetchApiRef,
  PageBlueprint,
  useApi,
} from '@backstage/frontend-plugin-api';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { useEntity } from '@backstage/plugin-catalog-react';
import EditIcon from '@material-ui/icons/Edit';

import { rootRouteRef } from './routes';
import { PatchEditDialog } from './components/PatchEditDialog';
import { formFieldsApiRef } from '@backstage/plugin-scaffolder-react/alpha';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { PatchDefinition } from './components/DefaultPatchesLayout/types';
import {
  mergePatchesFilters,
  filterPatchesForEntity,
} from './utils/patchFilter';
import { validatePatchConfig } from './utils/validatePatchConfig';
import { EntityPatchClient } from './api/EntityPatchClient';

const entityPatchContextMenuItem =
  EntityContextMenuItemBlueprint.makeWithOverrides({
    name: 'edit',

    factory: (originalFactory, { apis }) => {
      const configApi = apis.get(configApiRef);
      const patchesConfig = (configApi?.getOptional<PatchDefinition[]>(
        'entityPatch.patches',
      ) ?? []) as PatchDefinition[];

      validatePatchConfig(patchesConfig);

      return originalFactory({
        icon: <EditIcon fontSize="small" />,
        filter: mergePatchesFilters(patchesConfig),
        useProps: () => {
          const { entity } = useEntity();
          const dialogApi = useApi(dialogApiRef);
          const formFieldsApi = useApi(formFieldsApiRef);
          const discoveryApi = useApi(discoveryApiRef);
          const fetchApi = useApi(fetchApiRef);
          const matchingPatches = filterPatchesForEntity(patchesConfig, entity);
          const patchClient = new EntityPatchClient({ discoveryApi, fetchApi });
          return {
            title: 'Edit Patch',
            onClick: async () => {
              const formFields = await formFieldsApi.loadFormFields();
              const { kind } = entity;
              const { namespace, name } = entity.metadata;
              let initialData = {};
              try {
                initialData = await patchClient.getInitialValues(
                  kind,
                  namespace ?? 'default',
                  name,
                );
              } catch {
                // Backend may not be installed; fall back to empty initial data
              }

              dialogApi.show(({ dialog }) => (
                <PatchEditDialog
                  dialog={dialog}
                  patches={matchingPatches}
                  initialData={initialData}
                  onSave={async data => {
                    for (const [patchName, patchData] of Object.entries(data)) {
                      const record = patchData as Record<string, unknown>;
                      // Skip patches with no data — nothing to persist
                      if (!record || Object.keys(record).length === 0) continue;
                      await patchClient.savePatch(
                        kind,
                        namespace ?? 'default',
                        name,
                        patchName,
                        record,
                      );
                    }
                  }}
                  formFields={
                    formFields as unknown[] as FieldExtensionOptions<any, any>[]
                  }
                />
              ));
            },
          };
        },
      });
    },
  });

const entityPatchPage = PageBlueprint.make({
  params: {
    path: '/entity-patch/:namespace/:kind/:name',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/EntityPatchPage/EntityPatchPage').then(m => (
        <m.EntityPatchPage />
      )),
  },
});

export const entityPatchPlugin = createFrontendPlugin({
  pluginId: 'entity-patch',
  extensions: [entityPatchContextMenuItem, entityPatchPage],
  routes: {
    root: rootRouteRef,
  },
});
