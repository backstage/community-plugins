/*
 * Copyright 2025 The Backstage Authors
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
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNew from '@material-ui/icons/OpenInNew';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Alert from '@material-ui/lab/Alert';
import { useCallback, useMemo, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { akeylessApiRef, AkeylessSecret } from '../../api';
import {
  AKEYLESS_ALLOW_CRUD_ANNOTATION,
  AKEYLESS_SECRET_PATH_ANNOTATION,
  AKEYLESS_SECRET_TYPES_ANNOTATION,
  DEFAULT_SECRET_TYPES,
} from '../../constants';
import { SecretCrudDialog } from '../SecretCrudDialog';

const STATIC_SECRET_TYPE = 'static-secret';

export const akeylessSecretConfig = (entity: Entity) => {
  const secretPathAnnotation =
    entity.metadata.annotations?.[AKEYLESS_SECRET_PATH_ANNOTATION];
  const secretPaths = secretPathAnnotation
    ? secretPathAnnotation
        .split(',')
        .map(path => path.trim())
        .filter(Boolean)
    : [];

  const typesAnnotation =
    entity.metadata.annotations?.[AKEYLESS_SECRET_TYPES_ANNOTATION];
  const itemTypes = typesAnnotation
    ? typesAnnotation
        .split(',')
        .map(type => type.trim())
        .filter(Boolean)
    : [...DEFAULT_SECRET_TYPES];

  const allowCrud =
    entity.metadata.annotations?.[AKEYLESS_ALLOW_CRUD_ANNOTATION] !== 'false';

  return { secretPaths, itemTypes, allowCrud };
};

export const EntityAkeylessTable = ({ entity }: { entity: Entity }) => {
  const akeylessApi = useApi(akeylessApiRef);
  const alertApi = useApi(alertApiRef);
  const {
    secretPaths,
    itemTypes,
    allowCrud: entityAllowCrud,
  } = akeylessSecretConfig(entity);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedPath, setSelectedPath] = useState(secretPaths[0] ?? '/');
  const [createOpen, setCreateOpen] = useState(false);
  const [editSecret, setEditSecret] = useState<AkeylessSecret>();
  const [editInitialValue, setEditInitialValue] = useState('');
  const [deleteSecret, setDeleteSecret] = useState<AkeylessSecret>();
  const [viewSecret, setViewSecret] = useState<AkeylessSecret>();
  const [viewValue, setViewValue] = useState<string>();
  const [viewLoading, setViewLoading] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);

  const reload = useCallback(() => {
    setReloadToken(current => current + 1);
  }, []);

  if (!secretPaths.length) {
    throw Error(
      `The secret path is undefined. Please define the annotation ${AKEYLESS_SECRET_PATH_ANNOTATION}`,
    );
  }

  const {
    value: listResults,
    loading,
    error,
  } = useAsync(async () => {
    const results = await Promise.all(
      secretPaths.map(async path => {
        const response = await akeylessApi
          .listSecrets(path, { itemTypes })
          .catch(() => ({
            secrets: [],
            consoleUrl: undefined,
            allowCrud: false,
          }));

        return {
          path,
          secrets: response.secrets,
          consoleUrl: response.consoleUrl,
          allowCrud: response.allowCrud ?? false,
        };
      }),
    );
    return results;
  }, [secretPaths.join(','), itemTypes.join(','), reloadToken]);

  const backendAllowCrud =
    listResults?.some(result => result.allowCrud) ?? false;
  const crudEnabled = entityAllowCrud && backendAllowCrud;

  const openViewDialog = async (secret: AkeylessSecret) => {
    setViewSecret(secret);
    setViewVisible(false);
    setViewValue(undefined);
    setViewLoading(true);
    try {
      const response = await akeylessApi.getStaticSecretValue(
        secret.fullPath,
        secret.path,
      );
      setViewValue(response.value);
    } catch (viewError) {
      alertApi.post({
        message:
          viewError instanceof Error
            ? viewError.message
            : 'Failed to load secret value',
        severity: 'error',
      });
      setViewSecret(undefined);
    } finally {
      setViewLoading(false);
    }
  };

  const columns: TableColumn[] = useMemo(() => {
    const baseColumns: TableColumn[] = [
      { title: 'Path', field: 'path', width: '12%' },
      { title: 'Item', field: 'item', highlight: true, width: '30%' },
      { title: 'Type', field: 'type', width: '12%' },
      { title: 'View in Akeyless', field: 'view', width: '10%' },
    ];

    if (crudEnabled) {
      baseColumns.push({ title: 'Actions', field: 'actions', width: '16%' });
    } else {
      baseColumns.push({ title: 'Manage', field: 'edit', width: '10%' });
    }

    return baseColumns;
  }, [crudEnabled]);

  const data: Array<Record<string, unknown>> = [];

  (listResults || []).forEach(({ path, secrets, consoleUrl }) => {
    if (secrets.length === 0) {
      data.push({
        path,
        item: (
          <Typography variant="body2" color="textSecondary">
            No items found.{' '}
            {consoleUrl ? (
              <Link to={consoleUrl} target="_blank">
                Open in Akeyless Console
              </Link>
            ) : null}
          </Typography>
        ),
        type: null,
        view: null,
        edit: null,
        actions: null,
      });
      return;
    }

    secrets.forEach((secret, index) => {
      const isStaticSecret = secret.itemType === STATIC_SECRET_TYPE;
      const row: Record<string, unknown> = {
        path: index === 0 ? path : '',
        item: secret.fullPath,
        type: secret.itemType,
        view: (
          <Link to={secret.showUrl} target="_blank">
            <OpenInNew fontSize="small" />
          </Link>
        ),
        edit: (
          <Link to={secret.editUrl} target="_blank">
            <OpenInNew fontSize="small" />
          </Link>
        ),
      };

      if (crudEnabled) {
        row.actions = isStaticSecret ? (
          <Box display="flex">
            <Tooltip title="View value">
              <IconButton size="small" onClick={() => openViewDialog(secret)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit value">
              <IconButton
                size="small"
                onClick={async () => {
                  setEditSecret(secret);
                  setEditInitialValue('');
                  try {
                    const response = await akeylessApi.getStaticSecretValue(
                      secret.fullPath,
                      secret.path,
                    );
                    setEditInitialValue(response.value);
                  } catch {
                    setEditInitialValue('');
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => setDeleteSecret(secret)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="caption" color="textSecondary">
            Console only
          </Typography>
        );
      }

      data.push(row);
    });
  });

  if (error) {
    return (
      <Alert severity="error">
        Unexpected error while fetching secrets from path(s) &apos;
        {secretPaths.join(', ')}&apos;: {error.message}
      </Alert>
    );
  }

  const subtitle =
    secretPaths.length === 1
      ? `Akeyless items for ${entity.metadata.name} in ${secretPaths[0]}`
      : `Akeyless items for ${entity.metadata.name} across ${secretPaths.length} paths`;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Box>
          <Typography variant="h6">{subtitle}</Typography>
          <Typography variant="body2" color="textSecondary">
            {crudEnabled
              ? 'Static secrets can be viewed, created, updated, and deleted here. Other item types link to the Akeyless Console.'
              : 'Secret values are not shown here. Use the links to view or manage items in the Akeyless Console.'}
          </Typography>
        </Box>
        {crudEnabled ? (
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPath(secretPaths[0] ?? '/');
              setCreateOpen(true);
            }}
          >
            Create static secret
          </Button>
        ) : null}
      </Box>

      <Table
        title="Akeyless items"
        options={{ paging: true, pageSize: 20, search: true }}
        columns={columns}
        data={data}
        isLoading={loading}
      />

      <SecretCrudDialog
        open={createOpen}
        mode="create"
        contextPath={selectedPath}
        onClose={() => setCreateOpen(false)}
        onSubmit={async ({ name, value: secretValue }) => {
          await akeylessApi.createStaticSecret(name, secretValue, selectedPath);
          alertApi.post({
            message: `Created static secret '${name}'`,
            severity: 'success',
          });
          reload();
        }}
      />

      {editSecret ? (
        <SecretCrudDialog
          open
          mode="edit"
          contextPath={editSecret.path}
          secretName={editSecret.fullPath}
          initialValue={editInitialValue}
          onClose={() => setEditSecret(undefined)}
          onSubmit={async ({ name, value: secretValue }) => {
            await akeylessApi.updateStaticSecretValue(
              name,
              secretValue,
              editSecret.path,
            );
            alertApi.post({
              message: `Updated static secret '${editSecret.fullPath}'`,
              severity: 'success',
            });
            setEditSecret(undefined);
            reload();
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(deleteSecret)}
        onClose={() => setDeleteSecret(undefined)}
      >
        <DialogTitle>Delete static secret?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete{' '}
            <strong>{deleteSecret?.fullPath}</strong> from Akeyless.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSecret(undefined)}>Cancel</Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={async () => {
              if (!deleteSecret) {
                return;
              }
              await akeylessApi.deleteStaticSecret(
                deleteSecret.fullPath,
                deleteSecret.path,
              );
              alertApi.post({
                message: `Deleted static secret '${deleteSecret.fullPath}'`,
                severity: 'success',
              });
              setDeleteSecret(undefined);
              reload();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(viewSecret)}
        onClose={() => setViewSecret(undefined)}
      >
        <DialogTitle>{viewSecret?.fullPath}</DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Typography variant="body2">Loading secret value...</Typography>
          ) : (
            <Box display="flex" alignItems="center">
              <Typography
                variant="body2"
                component="pre"
                style={{
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  flex: 1,
                  margin: 0,
                }}
              >
                {viewVisible ? viewValue : '••••••••'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setViewVisible(current => !current)}
              >
                {viewVisible ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewSecret(undefined)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
