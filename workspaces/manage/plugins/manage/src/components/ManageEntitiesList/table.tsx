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
import { useCallback, useMemo, useRef } from 'react';

import Tooltip from '@mui/material/Tooltip';
import { capitalize } from '@mui/material/utils';
import BusinessIcon from '@mui/icons-material/Business';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { Table, TableOptions, TableColumn } from '@backstage/core-components';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import {
  KindStarred,
  ManageColumnModule,
  simplifyColumns,
  useOwnedEntities,
  useCurrentKindTitle,
  pluralizeKind,
} from '@backstage-community/plugin-manage-react';

import { ManageColumnSimple, isManageColumnSimple } from './utils';
import { ReRender } from './ReRender';
import {
  defaultPageSize,
  EntitiesTablePageSizeProvider,
  useEntitesTablePageSize,
  useSetEntitesTablePageSize,
} from './table-settings';

/** @public */
export type TableRow = {
  entity: Entity;
  id?: string;
};

function Lifecycle(props: { entity: Entity }) {
  const lifecycle = props.entity.spec?.lifecycle ?? '';

  if (lifecycle === 'production') {
    return (
      <Tooltip title="Production">
        <BusinessIcon style={{ fontSize: 'inherit' }} />
      </Tooltip>
    );
  } else if (lifecycle === 'experimental') {
    return (
      <Tooltip title="Experimental">
        <ScatterPlotIcon style={{ fontSize: 'inherit' }} />
      </Tooltip>
    );
  } else if (lifecycle === 'deprecated') {
    return (
      <Tooltip title="Deprecated">
        <DeleteOutlineIcon style={{ fontSize: 'inherit' }} />
      </Tooltip>
    );
  }

  return <></>;
}

/** @public */
type Column = ManageColumnSimple | ManageColumnModule;

export { type Column as TableColumn };

/** @public */
export interface ManageEntitiesTableProps {
  columns?: Column[];
  options?: TableOptions<TableRow>;
  title?: string;
  subtitle?: string;
}

/**
 * Props for the {@link ManageEntitiesTable} component.
 *
 * @public
 */
export interface ManageEntitiesTableSpecificProps
  extends ManageEntitiesTableProps {
  kind?: string;
  starred?: boolean;
}

const defaultPageSizeOptions = [defaultPageSize, 25, 50, 100];

function ManageEntitiesTableInner(
  props: ManageEntitiesTableSpecificProps & { entities: Entity[] },
) {
  const { kind, options, entities, title, subtitle } = props;

  const defaultColumns: TableColumn<TableRow>[] = useMemo(
    () => [
      ...(kind === undefined
        ? [
            {
              title: 'Kind',
              render(data) {
                return data.entity.kind;
              },
            } satisfies TableColumn<TableRow>,
          ]
        : []),
      {
        title: kind ? capitalize(kind) : 'Name',
        render(data, _type) {
          return (
            <>
              <EntityRefLink
                title={data.entity.metadata.name}
                hideIcon
                entityRef={data.entity}
              />
            </>
          );
        },
      } satisfies TableColumn<TableRow>,
      {
        title: 'Title',
        render(data, _type) {
          return (
            <>
              <Lifecycle entity={data.entity} />
              <EntityRefLink entityRef={data.entity} />
            </>
          );
        },
      },
      ...(kind === 'component'
        ? [
            {
              title: 'Type',
              render(data) {
                return data.entity.spec?.type;
              },
            } satisfies TableColumn<TableRow>,
          ]
        : []),
      {
        title: 'Owner',
        render(data, _type) {
          if (data.entity.spec?.owner) {
            const owner = parseEntityRef(`${data.entity.spec.owner}`, {
              defaultKind: 'group',
            });
            return <EntityRefLink entityRef={owner} />;
          }
          return <></>;
        },
      },
    ],
    [kind],
  );

  const simpleColsRef = useRef<{
    renderers: Map<Column, TableColumn<TableRow>>;
  }>({} as any);
  simpleColsRef.current.renderers ??= new Map();

  const setOnce = useCallback((col: ManageColumnSimple) => {
    let tableColumn = simpleColsRef.current.renderers.get(col);
    if (!tableColumn) {
      tableColumn = {
        title: col.title,
        id: col.id,
        render(data) {
          return <col.component entity={data.entity} />;
        },
      };
      simpleColsRef.current.renderers.set(col, tableColumn);
    }
    return tableColumn;
  }, []);

  const extraColumns = (props.columns ?? []).flatMap(
    (col): TableColumn<TableRow> | TableColumn<TableRow>[] =>
      isManageColumnSimple(col)
        ? setOnce(col)
        : simplifyColumns(col)
            .getColumns(entities)
            .map(innerCol => innerCol),
  );

  const columns: TableColumn<TableRow>[] = [...defaultColumns, ...extraColumns];

  const data: TableRow[] = useMemo(
    () =>
      entities.map(entity => ({
        entity,
        id: stringifyEntityRef(entity),
      })),
    [entities],
  );

  const pageSizeOptions = options?.pageSizeOptions ?? defaultPageSizeOptions;
  // const [pageSize = defaultPageSize, setPageSize] = useEntitesTablePageSize(
  //   options?.pageSize ?? pageSizeOptions[0] ?? defaultPageSize,
  // );
  const pageSize = useEntitesTablePageSize() ?? defaultPageSize;
  const setPageSize = useSetEntitesTablePageSize();
  const paging = options?.paging ?? pageSizeOptions[0] < data.length;

  const customOptions: TableOptions<TableRow> = {
    pageSize,
    pageSizeOptions,
    paging,
  };

  const kindTitle = useCurrentKindTitle();
  const tableTitle = title ?? `Your ${kindTitle}`;
  const tableSubtitle =
    subtitle ??
    `These ${
      kind ? pluralizeKind(kind) : 'entities'
    } are owned by you, or groups you belong to`;

  const onPageChange = useCallback(
    (_: number, newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPageSize(newPageSize);
      }
    },
    [pageSize, setPageSize],
  );

  const table = (
    <Table
      title={tableTitle}
      subtitle={tableSubtitle}
      columns={columns}
      data={data}
      options={{
        padding: 'dense',
        search: false,
        paginationPosition: 'top',
        showFirstLastPageButtons: true,
        emptyRowsWhenPaging: false,
        ...options,
        ...customOptions,
      }}
      onPageChange={onPageChange}
    />
  );

  return table;
}

function ManageEntitiesOwned(props: ManageEntitiesTableSpecificProps) {
  const entities = useOwnedEntities(props.kind);

  return (
    <EntitiesTablePageSizeProvider>
      <ManageEntitiesTableInner
        columns={props.columns}
        kind={props.kind}
        options={props.options}
        entities={entities}
      />
    </EntitiesTablePageSizeProvider>
  );
}

function ManageEntitiesStarred(props: ManageEntitiesTableSpecificProps) {
  const entities = useOwnedEntities(KindStarred);

  return (
    <EntitiesTablePageSizeProvider>
      <ManageEntitiesTableInner
        columns={props.columns}
        options={props.options}
        entities={entities}
        subtitle=""
      />
    </EntitiesTablePageSizeProvider>
  );
}

/**
 * The table that shows entities of a certain kind (or all kinds, or starred
 * entities)
 *
 * @public
 */
export function ManageEntitiesTable(props: ManageEntitiesTableSpecificProps) {
  const { starred } = props;

  return (
    <ReRender uniq={`cols-${props.columns?.length}-${props.kind}`}>
      {starred ? (
        <ManageEntitiesStarred
          columns={props.columns}
          kind={props.kind}
          options={props.options}
        />
      ) : (
        <ManageEntitiesOwned
          columns={props.columns}
          kind={props.kind}
          options={props.options}
        />
      )}
    </ReRender>
  );
}
