/*
 * Copyright 2022 The Backstage Authors
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

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  ErrorPanel,
  SubvalueCell,
  Table,
  TableFilter,
} from '@backstage/core-components';
import { errorApiRef, useApi, alertApiRef } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { usePermission } from '@backstage/plugin-permission-react';
import { permissions } from '@backstage-community/plugin-playlist-common';
import AddBoxIcon from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import useAsyncFn from 'react-use/esm/useAsyncFn';

import { playlistApiRef } from '../../api';
import { useTitle } from '../../hooks';
import { AddEntitiesDrawer } from './AddEntitiesDrawer';

export const PlaylistEntitiesTable = ({
  playlistId,
}: {
  playlistId: string;
}) => {
  const errorApi = useApi(errorApiRef);
  const playlistApi = useApi(playlistApiRef);
  const alertApi = useApi(alertApiRef);
  const [openAddEntitiesDrawer, setOpenAddEntitiesDrawer] = useState(false);

  const { allowed: editAllowed } = usePermission({
    permission: permissions.playlistListUpdate,
    resourceRef: playlistId,
  });

  const [{ value: entities, loading, error }, loadEntities] = useAsyncFn(
    () => playlistApi.getPlaylistEntities(playlistId),
    [playlistApi],
  );

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const addEntity = useCallback(
    async (entityRef: string) => {
      try {
        await playlistApi.addPlaylistEntities(playlistId, [entityRef]);
        loadEntities();
      } catch (e) {
        errorApi.post(e);
      }
    },
    [errorApi, loadEntities, playlistApi, playlistId],
  );

  const removeEntity = useCallback(
    async (_: unknown, entity: Entity | Entity[]) => {
      try {
        const entityArray = [entity].flat();
        const entityNames = entityArray.map(
          item => item.metadata.title ?? item.metadata.name,
        );
        await playlistApi.removePlaylistEntities(
          playlistId,
          [entity].flat().map(stringifyEntityRef),
        );
        loadEntities();
        const message =
          entityNames.length === 1
            ? `Removed entity '${entityNames[0]}'`
            : `Removed entities: '${entityNames.join("', '")}'`;

        alertApi.post({
          message,
          severity: 'success',
          display: 'transient',
        });
      } catch (e) {
        errorApi.post(e);
      }
    },
    [errorApi, loadEntities, playlistApi, playlistId, alertApi],
  );

  const singularTitleLowerCase = useTitle({
    pluralize: false,
    lowerCase: true,
  });

  const actions = editAllowed
    ? [
        {
          icon: () => <DeleteIcon color="secondary" />,
          tooltip: `Remove from ${singularTitleLowerCase}`,
          onClick: removeEntity,
        },
        {
          icon: AddBoxIcon,
          tooltip: `Add entities to ${singularTitleLowerCase}`,
          isFreeAction: true,
          onClick: () => setOpenAddEntitiesDrawer(true),
        },
      ]
    : [];

  const columns = [
    // These hidden columns are defined to allow them to be searchable/filterable
    { title: 'Kind', field: 'kind', hidden: true, searchable: true },
    { title: 'Type', field: 'spec.type', hidden: true, searchable: true },
    { title: 'Title', field: 'metadata.title', hidden: true, searchable: true },
    {
      title: 'Name',
      field: 'metadata.name',
      highlight: true,
      width: '25%',
      customSort: (a: Entity, b: Entity) => {
        const titleA = (a.metadata.title ?? a.metadata.name) as string;
        const titleB = (b.metadata.title ?? b.metadata.name) as string;
        return titleA.localeCompare(titleB);
      },
      render: (entity: Entity) => (
        <SubvalueCell
          value={
            <EntityRefLink
              entityRef={entity}
              defaultKind={entity.kind}
              title={entity.metadata.title}
            />
          }
          subvalue={`${entity.kind}${
            entity.spec?.type ? ` - ${entity.spec?.type}` : ''
          }`}
        />
      ),
    },
    { title: 'Description', field: 'metadata.description', width: '75%' },
  ];

  const filters: TableFilter[] = [
    { column: 'Kind', type: 'multiple-select' },
    { column: 'Type', type: 'multiple-select' },
  ];

  if (error) {
    return (
      <ErrorPanel
        defaultExpanded
        title="Failed to load entities"
        error={error}
      />
    );
  }

  return (
    <>
      <Table<Entity>
        actions={actions}
        columns={columns}
        data={entities ?? []}
        filters={filters}
        icons={{
          ...Table.icons,
          Search: forwardRef((props, ref) => (
            <SearchIcon {...props} ref={ref} />
          )),
        }}
        isLoading={loading}
        localization={{ toolbar: { searchPlaceholder: 'Search' } }}
        options={{
          actionsColumnIndex: -1,
          emptyRowsWhenPaging: false,
          loadingType: 'linear',
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
          paging: true,
          showEmptyDataSourceMessage: !loading,
        }}
      />
      <AddEntitiesDrawer
        currentEntities={entities ?? []}
        open={openAddEntitiesDrawer}
        onAdd={addEntity}
        onClose={() => setOpenAddEntitiesDrawer(false)}
      />
    </>
  );
};
