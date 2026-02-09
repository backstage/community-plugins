/*
 * Copyright 2020 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Edit from '@material-ui/icons/Edit';
import Visibility from '@material-ui/icons/Visibility';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/esm/useAsync';
import { VaultSecret, vaultApiRef } from '../../api';
import {
  VAULT_SECRET_ENGINE_ANNOTATION,
  VAULT_SECRET_PATH_ANNOTATION,
} from '../../constants';

export const vaultSecretConfig = (entity: Entity) => {
  const secretPathAnnotation =
    entity.metadata.annotations?.[VAULT_SECRET_PATH_ANNOTATION];
  const secretPaths = secretPathAnnotation
    ? secretPathAnnotation
        .split(',')
        .map(path => path.trim())
        .filter(Boolean)
    : [];
  const secretEngine =
    entity.metadata.annotations?.[VAULT_SECRET_ENGINE_ANNOTATION];

  return { secretPaths, secretEngine };
};

export const EntityVaultTable = ({ entity }: { entity: Entity }) => {
  const vaultApi = useApi(vaultApiRef);
  const { secretPaths, secretEngine } = vaultSecretConfig(entity);
  if (!secretPaths || secretPaths.length === 0) {
    throw Error(
      `The secret path is undefined. Please, define the annotation ${VAULT_SECRET_PATH_ANNOTATION}`,
    );
  }

  const { value, loading, error } = useAsync(async (): Promise<
    { path: string; secrets: VaultSecret[]; createUrl?: string }[]
  > => {
    const results = await Promise.all(
      secretPaths.map(async path => {
        const response = await vaultApi
          .listSecrets(path, { secretEngine })
          .catch(() => ({
            secrets: [],
            createUrl: undefined,
          }));
        return {
          path,
          secrets: response.secrets,
          createUrl: response.createUrl,
        };
      }),
    );
    return results;
  }, []);

  const columns: TableColumn[] = [
    { title: 'Path', field: 'path', width: '20%' },
    { title: 'Secret', field: 'secret', highlight: true },
    { title: 'View', field: 'view', width: '10%' },
    { title: 'Edit', field: 'edit', width: '10%' },
  ];

  const data: any[] = [];

  (value || []).forEach(({ path, secrets, createUrl }) => {
    if (secrets.length === 0) {
      // No secrets in this path - show a link to create one
      data.push({
        path,
        secret: (
          <Typography variant="body2" color="textSecondary">
            No secrets, <Link to={createUrl || ''}>create one</Link>
          </Typography>
        ),
        view: null,
        edit: null,
      });
    } else {
      secrets.forEach((secret, index) => {
        const secretName = `${secret.path.replace(`${path}/`, '')}/${
          secret.name
        }`;
        data.push({
          path: index === 0 ? path : '',
          secret: secretName,
          view: (
            <Link
              aria-label="View"
              title={`View ${secretName}`}
              to={secret.showUrl}
            >
              <Visibility style={{ fontSize: 16 }} />
            </Link>
          ),
          edit: (
            <Link
              aria-label="Edit"
              title={`Edit ${secretName}`}
              to={secret.editUrl}
            >
              <Edit style={{ fontSize: 16 }} />
            </Link>
          ),
        });
      });
    }
  });

  if (error) {
    return (
      <Alert severity="error">
        Unexpected error while fetching secrets from path(s) '
        {secretPaths.join(', ')}': {error.message}
      </Alert>
    );
  }

  const subtitle =
    secretPaths.length === 1
      ? `Secrets for ${entity.metadata.name} in ${secretPaths[0]}`
      : `Secrets for ${entity.metadata.name} in ${secretPaths.length} paths`;

  return (
    <Table
      title="Vault"
      subtitle={subtitle}
      columns={columns}
      data={data}
      isLoading={loading}
      options={{
        padding: 'dense',
        pageSize: 10,
        emptyRowsWhenPaging: false,
        search: false,
      }}
      emptyContent={
        <Box style={{ textAlign: 'center', padding: '15px' }}>
          <Typography variant="body1">
            No secrets found for {entity.metadata.name} in{' '}
            {secretPaths.join(', ')}
          </Typography>
        </Box>
      }
    />
  );
};
