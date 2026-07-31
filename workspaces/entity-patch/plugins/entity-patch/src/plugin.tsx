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
import { useEffect, useState } from 'react';
import {
  configApiRef,
  createFrontendPlugin,
  dialogApiRef,
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
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';
import {
  mergePatchesFilters,
  filterPatchesForEntity,
} from './utils/patchFilter';
import { validatePatchConfig } from '@backstage-community/plugin-entity-patch-common';
import { saveAllPatches } from './utils/saveAllPatches';
import {
  CONFIG_KEYS,
  DEFAULT_NAMESPACE,
} from '@backstage-community/plugin-entity-patch-common';
import { useEntityPatchClient } from './hooks/useEntityPatchClient';

const entityPatchContextMenuItem =
  EntityContextMenuItemBlueprint.makeWithOverrides({
    name: 'edit',

    factory: (originalFactory, { apis }) => {
      const configApi = apis.get(configApiRef);
      const patchesConfig = (configApi?.getOptional<PatchDefinition[]>(
        CONFIG_KEYS.PATCHES,
      ) ?? []) as PatchDefinition[];

      validatePatchConfig(patchesConfig);

      return originalFactory({
        icon: <EditIcon fontSize="small" />,
        filter: mergePatchesFilters(patchesConfig),
        useProps: () => {
          const { entity } = useEntity();
          const dialogApi = useApi(dialogApiRef);
          const formFieldsApi = useApi(formFieldsApiRef);
          const matchingPatches = filterPatchesForEntity(patchesConfig, entity);
          const patchClient = useEntityPatchClient();
          const [formFields, setFormFields] = useState<
            FieldExtensionOptions<any, any>[]
          >([]);
          useEffect(() => {
            formFieldsApi.loadFormFields().then(fields => {
              setFormFields(
                fields as unknown[] as FieldExtensionOptions<any, any>[],
              );
            });
          }, [formFieldsApi]);
          return {
            title: 'Edit Entity',
            onClick: async () => {
              const { kind } = entity;
              const { namespace, name } = entity.metadata;
              let initialData = {};
              let loadError = false;
              try {
                initialData = await patchClient.getInitialValues(
                  kind,
                  namespace ?? DEFAULT_NAMESPACE,
                  name,
                );
              } catch {
                // Backend may not be installed; fall back to empty initial data
                loadError = true;
              }

              dialogApi.open(({ dialog }) => (
                <PatchEditDialog
                  dialog={dialog}
                  patches={matchingPatches}
                  initialData={initialData}
                  loadError={loadError}
                  onSave={async data => {
                    await saveAllPatches(
                      patchClient,
                      kind,
                      namespace ?? DEFAULT_NAMESPACE,
                      name,
                      data,
                    );
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

/**
 * The Entity Patch plugin for Backstage, which provides functionality to create and manage patches for entities in the Backstage catalog.
 *
 * @public
 */
export const entityPatchPlugin = createFrontendPlugin({
  pluginId: 'entity-patch',
  extensions: [entityPatchContextMenuItem, entityPatchPage],
  routes: {
    root: rootRouteRef,
  },
});
