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
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  toastApiRef,
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { formFieldsApiRef } from '@backstage/plugin-scaffolder-react/alpha';
import { JsonValue } from '@backstage/types';
import { Box, Button, Flex, Text } from '@backstage/ui';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { useParams } from 'react-router-dom';
import { DefaultPatchesLayout } from '../DefaultPatchesLayout';
import { PatchDefinition } from '../DefaultPatchesLayout/types';
import { filterPatchesForEntity } from '../../utils/patchFilter';
import { EntityPatchClient } from '../../api/EntityPatchClient';

type PatchData = Record<string, JsonValue>;
type PatchesData = Record<string, PatchData>;

export const EntityPatchPage = () => {
  const { namespace, kind, name } = useParams<{
    namespace: string;
    kind: string;
    name: string;
  }>();

  const configApi = useApi(configApiRef);
  const catalogApi = useApi(catalogApiRef);
  const formFieldsApi = useApi(formFieldsApiRef);
  const toastApi = useApi(toastApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const patchClient = new EntityPatchClient({ discoveryApi, fetchApi });

  const allPatches = (configApi.getOptional<PatchDefinition[]>(
    'entityPatch.patches',
  ) ?? []) as PatchDefinition[];

  // Load entity + initial values together so DefaultPatchesLayout mounts
  // only once both are available (prevents the useState initializer from
  // running with empty data before the async fetch completes).
  const {
    loading,
    error: loadError,
    value: entityData,
  } = useAsync(async () => {
    const entity = await catalogApi.getEntityByRef({
      namespace: namespace!,
      kind: kind!,
      name: name!,
    });
    if (!entity) {
      throw new Error(`Entity ${kind}:${namespace}/${name} not found`);
    }
    let initialValues: PatchesData = {};
    try {
      initialValues = (await patchClient.getInitialValues(
        entity.kind,
        entity.metadata.namespace ?? 'default',
        entity.metadata.name,
      )) as PatchesData;
    } catch {
      // Backend may not be installed; start with empty form data
    }
    return { entity, initialValues };
  }, [catalogApi, namespace, kind, name]);

  const [extensions, setExtensions] = useState<
    FieldExtensionOptions<any, any>[]
  >([]);
  const [formData, setFormData] = useState<PatchesData>({});
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    formFieldsApi.loadFormFields().then(fields => {
      setExtensions(fields as unknown[] as FieldExtensionOptions<any, any>[]);
    });
  }, [formFieldsApi]);

  if (loadError) {
    return <ResponseErrorPanel error={loadError} />;
  }

  if (loading || !entityData) {
    return <Progress />;
  }

  const { entity, initialValues } = entityData;
  const patches = filterPatchesForEntity(allPatches, entity);
  const entityRef = `${entity.kind}:${entity.metadata.namespace ?? 'default'}/${entity.metadata.name}`;

  const handleSave = async () => {
    try {
      for (const [patchName, patchData] of Object.entries(formData)) {
        const record = patchData as Record<string, unknown>;
        // Skip patches with no data — nothing to persist
        if (!record || Object.keys(record).length === 0) continue;
        await patchClient.savePatch(
          entity.kind,
          entity.metadata.namespace ?? 'default',
          entity.metadata.name,
          patchName,
          record,
        );
      }
      toastApi.post({
        title: 'Patch saved successfully.',
        status: 'success',
        timeout: 5000,
      });
    } catch (err: any) {
      toastApi.post({
        title: 'Failed to save patch',
        description: err?.message ?? 'Unknown error',
        status: 'danger',
      });
    }
  };

  return (
    <>
      <Flex align="center" style={{ gap: 8, marginBottom: 16 }}>
        <ArrowBackIcon fontSize="small" color="action" />
        <EntityRefLink entityRef={entityRef} />
        <Text>
          {entity.kind}
          {(entity.spec as any)?.type ? ` · ${(entity.spec as any).type}` : ''}
        </Text>
      </Flex>

      <Box style={{ maxWidth: 720, margin: '0 auto' }}>
        <DefaultPatchesLayout
          patches={patches}
          initialData={initialValues}
          onChange={(data, options) => {
            setFormData(data);
            setIsValid(options.isValid);
            if (options.isDirty) setIsDirty(true);
          }}
          extensions={extensions}
        />
        <Flex justify="end" style={{ marginTop: 16 }}>
          <Button
            variant="primary"
            isDisabled={!isDirty || !isValid}
            onClick={handleSave}
          >
            Save
          </Button>
        </Flex>
      </Box>
    </>
  );
};
