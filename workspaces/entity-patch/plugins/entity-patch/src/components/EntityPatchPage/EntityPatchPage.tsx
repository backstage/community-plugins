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
import {
  Alert,
  Box,
  Button,
  ButtonIcon,
  Flex,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiArrowLeftLine } from '@remixicon/react';
import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { useNavigate, useParams } from 'react-router-dom';
import { DefaultPatchesLayout } from '../DefaultPatchesLayout';
import {
  CONFIG_KEYS,
  DEFAULT_NAMESPACE,
  PatchDefinition,
} from '@backstage-community/plugin-entity-patch-common';
import { filterPatchesForEntity } from '../../utils/patchFilter';
import { EntityPatchClient } from '../../api/EntityPatchClient';
import { saveAllPatches } from '../../utils/saveAllPatches';

type PatchData = Record<string, JsonValue>;
type PatchesData = Record<string, PatchData>;

export const EntityPatchPage = () => {
  const navigate = useNavigate();
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

  const patchClient = useMemo(
    () => new EntityPatchClient({ discoveryApi, fetchApi }),
    [discoveryApi, fetchApi],
  );

  const allPatches = (configApi.getOptional<PatchDefinition[]>(
    CONFIG_KEYS.PATCHES,
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
    let initialValuesError = false;
    try {
      initialValues = (await patchClient.getInitialValues(
        entity.kind,
        entity.metadata.namespace ?? DEFAULT_NAMESPACE,
        entity.metadata.name,
      )) as PatchesData;
    } catch {
      // Backend may not be installed; start with empty form data
      initialValuesError = true;
    }
    return { entity, initialValues, initialValuesError };
  }, [catalogApi, namespace, kind, name]);

  const [extensions, setExtensions] = useState<
    FieldExtensionOptions<any, any>[]
  >([]);
  const [formData, setFormData] = useState<PatchesData>({});
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [initialValuesAlertDismissed, setInitialValuesAlertDismissed] =
    useState(false);

  // Warn on page refresh/close when there are unsaved changes.
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

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

  const { entity, initialValues, initialValuesError } = entityData;
  const patches = filterPatchesForEntity(allPatches, entity);
  const entityRef = `${entity.kind}:${
    entity.metadata.namespace ?? DEFAULT_NAMESPACE
  }/${entity.metadata.name}`;

  const handleSave = async () => {
    try {
      await saveAllPatches(
        patchClient,
        entity.kind,
        entity.metadata.namespace ?? DEFAULT_NAMESPACE,
        entity.metadata.name,
        formData,
      );
      toastApi.post({
        title: 'Patch saved successfully.',
        status: 'success',
        timeout: 5000,
      });
      setIsDirty(false);
    } catch (err: any) {
      toastApi.post({
        title: 'Failed to save patch',
        description: err?.message ?? 'Unknown error',
        status: 'danger',
      });
    }
  };

  let saveTooltip = '';
  if (!isValid) saveTooltip = 'Fix validation errors before saving';
  else if (!isDirty) saveTooltip = 'No changes to save';

  return (
    <>
      <Flex align="center" style={{ gap: 8, marginBottom: 16 }}>
        <ButtonIcon
          variant="tertiary"
          size="small"
          icon={<RiArrowLeftLine />}
          aria-label="Go back"
          onClick={() => navigate(-1)}
        />
        <EntityRefLink entityRef={entityRef} />
        <Text>
          {entity.kind}
          {(entity.spec as { type?: string })?.type
            ? ` · ${(entity.spec as { type?: string }).type}`
            : ''}
        </Text>
      </Flex>

      <Box style={{ maxWidth: 720, margin: '0 auto' }}>
        {initialValuesError && !initialValuesAlertDismissed && (
          <Alert
            status="danger"
            title="Could not load patch data. Please try again."
            customActions={
              <Button
                variant="secondary"
                onClick={() => setInitialValuesAlertDismissed(true)}
              >
                Dismiss
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}
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
          <TooltipTrigger isDisabled={!saveTooltip}>
            <Button
              variant="primary"
              isDisabled={!isDirty || !isValid}
              onClick={handleSave}
            >
              Save
            </Button>
            <Tooltip>{saveTooltip}</Tooltip>
          </TooltipTrigger>
        </Flex>
      </Box>
    </>
  );
};
