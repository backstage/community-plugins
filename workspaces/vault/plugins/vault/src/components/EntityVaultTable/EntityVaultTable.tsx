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
import React from 'react';
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
  const secretPath =
    entity.metadata.annotations?.[VAULT_SECRET_PATH_ANNOTATION];
  const secretEngine =
    entity.metadata.annotations?.[VAULT_SECRET_ENGINE_ANNOTATION];

  return { secretPath, secretEngine };
};

export const EntityVaultTable = ({ entity }: { entity: Entity }) => {
  const vaultApi = useApi(vaultApiRef);
  const { secretPath, secretEngine } = vaultSecretConfig(entity);
  if (!secretPath) {
    throw Error(
      `The secret path is undefined. Please, define the annotation ${VAULT_SECRET_PATH_ANNOTATION}`,
    );
  }

  const { value, loading, error } = useAsync(async (): Promise<
    VaultSecret[]
  > => {
    return vaultApi.listSecrets(secretPath, { secretEngine });
  }, []);

  const columns: TableColumn[] = [
    { title: 'Secret', field: 'secret', highlight: true },
    { title: 'View URL', field: 'view', width: '10%' },
    { title: 'Edit URL', field: 'edit', width: '10%' },
  ];

  const data = (value || []).map(secret => {
    const secretName = `${secret.path.replace(`${secretPath}/`, '')}/${
      secret.name
    }`;

    return {
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
    };
  });

  if (error) {
    return (
      <Alert severity="error">
        Unexpected error while fetching secrets from path '{secretPath}':{' '}
        {error.message}
      </Alert>
    );
  }

  return (
    <Table
      title="Vault"
      subtitle={`Secrets for ${entity.metadata.name} in ${secretPath}`}
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
            No secrets found for {entity.metadata.name} in {secretPath}
          </Typography>
        </Box>
      }
    />
  );
};
