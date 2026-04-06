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
  alertApiRef,
  configApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { formFieldsApiRef } from '@backstage/plugin-scaffolder-react/alpha';
import { JsonValue } from '@backstage/types';
import { Button } from '@backstage/ui';
import { Box, Typography } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DefaultPatchesLayout } from '../DefaultPatchesLayout';
import { PatchDefinition } from '../DefaultPatchesLayout/types';
import { filterPatchesForEntity } from '../../utils/patchFilter';
import { Entity } from '@backstage/catalog-model';

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
  const alertApi = useApi(alertApiRef);

  const allPatches = (
    configApi.getOptional<PatchDefinition[]>('entityPatch.patches') ?? []
  ) as PatchDefinition[];

  const [entity, setEntity] = useState<Entity | undefined>();
  const [loadError, setLoadError] = useState<Error | undefined>();
  const [extensions, setExtensions] = useState<FieldExtensionOptions<any, any>[]>([]);
  // TODO: Pre-populate formData with current entity values once backend plugin is available.
  const [formData, setFormData] = useState<PatchesData>({});
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    catalogApi
      .getEntityByRef({ namespace: namespace!, kind: kind!, name: name! })
      .then(e => {
        if (!e) {
          setLoadError(new Error(`Entity ${kind}:${namespace}/${name} not found`));
        } else {
          setEntity(e);
        }
      })
      .catch(setLoadError);
  }, [catalogApi, namespace, kind, name]);

  useEffect(() => {
    formFieldsApi.loadFormFields().then(fields => {
      setExtensions(fields as unknown[] as FieldExtensionOptions<any, any>[]);
    });
  }, [formFieldsApi]);

  if (loadError) {
    return <ResponseErrorPanel error={loadError} />;
  }

  if (!entity) {
    return <Progress />;
  }

  const patches = filterPatchesForEntity(allPatches, entity);
  // Build entity ref string for EntityRefLink without needing @backstage/catalog-model at runtime
  const entityRef = `${entity.kind}:${entity.metadata.namespace ?? 'default'}/${entity.metadata.name}`;

  const handleSave = async () => {
    try {
      // TODO: call patch API with formData once backend plugin is available
      // eslint-disable-next-line no-console
      console.log('save', formData);
      alertApi.post({
        message: 'Patch saved successfully.',
        severity: 'success',
        display: 'transient',
      });
    } catch (err: any) {
      alertApi.post({
        message: `Failed to save patch: ${err?.message ?? 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" style={{ gap: 8, marginBottom: 16 }}>
        <ArrowBackIcon fontSize="small" color="action" />
        <EntityRefLink entityRef={entityRef} />
        <Typography variant="caption" color="textSecondary">
          {entity.kind}
          {(entity.spec as any)?.type ? ` · ${(entity.spec as any).type}` : ''}
        </Typography>
      </Box>

      <Box style={{ maxWidth: 720, margin: '0 auto' }}>
        <DefaultPatchesLayout
          patches={patches}
          onChange={(data, options) => {
            setFormData(data);
            setIsValid(options.isValid);
            if (options.isDirty) setIsDirty(true);
          }}
          extensions={extensions}
        />
        <Box display="flex" justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Button
            variant="primary"
            isDisabled={!isDirty || !isValid}
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};
