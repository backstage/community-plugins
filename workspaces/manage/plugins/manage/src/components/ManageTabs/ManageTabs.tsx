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

import { Fragment, ComponentProps, ReactNode, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import { capitalize } from '@mui/material/utils';

import { RoutedTabs, TableOptions } from '@backstage/core-components';

import {
  CurrentKindProvider,
  useKindOrder,
  useOwnedKinds,
  arrayify,
  pluralizeKind,
  useOrder,
} from '@backstage-community/plugin-manage-react';

import {
  TableColumn,
  ManageEntitiesTable,
  TableRow,
} from '../ManageEntitiesList';
import { useManagePageCombined } from '../ManagePageFilters';
import { MANAGE_KIND_COMMON } from './types';
import { Settings } from '../Settings';
import { TabsOrderProvider, useTabsOrder } from '../TabsOrder';

/** @public */
export type SubRouteTab = ComponentProps<typeof RoutedTabs>['routes'][number];

/**
 * Options for configuring how an entity kind is displayed.
 *
 * @public
 */
export interface ManageKindOptions {
  /**
   * A component header (or array of header components) to show above the entity
   * table.
   */
  header?: ReactNode;

  /**
   * A component footer (or array of footer components) to show above the entity
   * table.
   */
  footer?: ReactNode;

  /**
   * An array of columns to display in the entity table.
   */
  columns?: TableColumn[];

  /**
   * Table options for the entity table.
   */
  tableOptions?: TableOptions<TableRow>;
}

/**
 * Props for {@link ManageTabs}.
 *
 * @public
 */
export interface ManageTabsProps {
  /**
   * A component header (or array of header components) to show above all entity
   * kind tables.
   */
  commonHeader?: ReactNode;

  /**
   * A component footer (or array of footer components) to show below all entity
   * kind tables.
   */
  commonFooter?: ReactNode;

  /**
   * An array of columns to display in all entity tables.
   */
  commonColumns?: TableColumn[];

  /**
   * Show all entities (of different kinds) in the same table, instead of
   * rendering tabs for each kind.
   */
  combined?: ManageKindOptions;

  /**
   * Configuration of headers, footers and columns to display per entity kind.
   *
   * A special kind (imported as `MANAGE_KIND_COMMON`) can be used to specify
   * headers, footers and columns for all kinds. They can be overwritten by
   * specific kinds if a value is not undefined - an empty array will overwrite
   * and clear a value in `MANAGE_KIND_COMMON`.
   */
  kinds?: Record<string, ManageKindOptions>;

  /**
   * Turn off the 'Starred entities' tab, or specify its options.
   */
  starred?: false | ManageKindOptions;

  /**
   * Tabs to show _before_ the entity kind tabs
   */
  tabsBefore?: SubRouteTab[];

  /**
   * Tabs to show _after_ the entity kind tabs
   */
  tabsAfter?: SubRouteTab[];

  /**
   * If the user and corresponding groups don't own any entities, show this
   * component at the top
   */
  onNothingOwned?: ReactNode;

  /**
   * Render a "Settings" tab at the end of the tabs. This tab will contain a
   * way for users to re-order the tabs.
   *
   * If set to `true` (default), a default settings view will be added.
   * If set to `false`, no settings tab will be shown.
   * This can also be a custom component to render as the settings tab.
   */
  settings?: boolean | ReactNode;
}

const defaultNothingOwned = (
  <Alert severity="info">You and your team(s) don't own any entities</Alert>
);

/**
 * The main component for displaying tabs for entities, and other custom tabs.
 *
 * @public
 */
export function ManageTabsImpl(props: ManageTabsProps) {
  return (
    <TabsOrderProvider>
      <ManageTabsInner {...props} />
    </TabsOrderProvider>
  );
}

function ManageTabsInner(props: ManageTabsProps) {
  const {
    combined,
    commonColumns = [],
    kinds: kindSetup,
    starred = {},
    tabsBefore = [],
    tabsAfter = [],
    settings = true,
  } = props;

  const tabOrder = useTabsOrder() ?? [];

  const [settingsCombined] = useManagePageCombined();

  const kindSetupMap = useMemo(
    (): Map<string, ManageKindOptions> =>
      new Map(
        Object.entries(kindSetup ?? {}).map(([name, options]) => [
          name.toLocaleLowerCase('en-US'),
          options,
        ]),
      ),
    [kindSetup],
  );

  const commonHeader = arrayify(props.commonHeader);
  const commonFooter = arrayify(props.commonFooter);

  const ownedKinds = useOwnedKinds(true) ?? [];
  const kinds = useKindOrder(ownedKinds);

  const onNothingOwned =
    kinds.length === 0 ? props.onNothingOwned ?? defaultNothingOwned : null;

  const allKindsHeader = kindSetupMap.get(MANAGE_KIND_COMMON)?.header;
  const allKindsFooter = kindSetupMap.get(MANAGE_KIND_COMMON)?.footer;
  const allKindsColumns = kindSetupMap.get(MANAGE_KIND_COMMON)?.columns;
  const allKindsTableOptions =
    kindSetupMap.get(MANAGE_KIND_COMMON)?.tableOptions;

  const makeTable = (kind: string) => {
    const {
      header: headers,
      footer: footers,
      columns,
      tableOptions: kindTableOptions,
    } = kindSetupMap.get(kind) ?? {};

    const kindHeaders = [
      ...commonHeader,
      ...arrayify(headers ?? allKindsHeader),
    ];
    const kindFooters = [
      ...commonFooter,
      ...arrayify(footers ?? allKindsFooter),
    ];
    const kindColumns = arrayify(columns ?? allKindsColumns);
    const allColumns = [...commonColumns, ...(kindColumns ?? [])];
    const tableOptions = kindTableOptions ?? allKindsTableOptions;

    return (
      <CurrentKindProvider kind={kind}>
        {renderArray(kindHeaders?.length ? null : commonHeader)}
        {renderArray(kindHeaders)}
        <ManageEntitiesTable
          columns={allColumns}
          kind={kind}
          options={tableOptions}
        />
        {renderArray(kindFooters)}
        {renderArray(kindFooters?.length ? null : commonFooter)}
      </CurrentKindProvider>
    );
  };

  const makeGenericTable = (
    options: ManageKindOptions & { starred?: boolean },
  ): JSX.Element => {
    const table = (
      <>
        {renderArray(commonHeader)}
        {renderArray(options.header ?? null)}
        <ManageEntitiesTable
          columns={options.columns}
          options={options.tableOptions}
          starred={options.starred ?? false}
        />
        {renderArray(options.footer ?? null)}
        {renderArray(commonFooter)}
      </>
    );
    return table;
  };

  const makeStarredTab = (): SubRouteTab[] => {
    if (!starred) {
      return [];
    }

    const header = arrayify(starred.header);
    const footer = arrayify(starred.footer);
    const kindColumns = arrayify(starred.columns ?? allKindsColumns);
    const allColumns = [...commonColumns, ...kindColumns];

    return [
      {
        path: 'starred-entities',
        title: 'Starred entities',
        children: (
          <CurrentKindProvider starred>
            {makeGenericTable({
              columns: allColumns,
              tableOptions: starred.tableOptions,
              starred: true,
              header,
              footer,
            })}
          </CurrentKindProvider>
        ),
      },
    ];
  };

  const starredTab = makeStarredTab();

  const tabs = [
    ...tabsBefore,
    {
      path: 'entities',
      title: 'Entities...',
      children: <></>,
    },
    ...starredTab,
    ...tabsAfter,
  ];

  const orderedTabs = Array.from(
    useOrder(tabs, tabOrder, { keyOf: tab => tab.path }),
  );

  if (settings) {
    const tabsForSettings = Array.from(orderedTabs);
    orderedTabs.push({
      path: 'settings',
      title: 'Settings',
      children: <Settings tabs={tabsForSettings} content={settings} />,
    });
  }

  const makeCombinedEntitiesTab = (): SubRouteTab => ({
    path: 'entities',
    title: 'Entities',
    children: makeGenericTable(combined ?? {}),
  });

  const makeSeparateEntitiesTabs = (): SubRouteTab[] => {
    return kinds
      .filter(rawKind => typeof rawKind === 'string')
      .map((rawKind): SubRouteTab => {
        const kind = rawKind.toLocaleLowerCase('en-US');

        return {
          path: kind,
          title: capitalize(pluralizeKind(rawKind)),
          children: makeTable(kind),
        };
      });
  };

  return (
    <>
      {onNothingOwned}
      <RoutedTabs
        routes={orderedTabs.flatMap(tab => {
          if (tab.path === 'entities') {
            if (settingsCombined) {
              return makeCombinedEntitiesTab();
            }
            return makeSeparateEntitiesTabs();
          }
          return tab;
        })}
        key="manage-routed-tabs"
      />
    </>
  );
}

function maybeArrayify<T>(v: T | T[] | null): T[] | null {
  if (!v) {
    return null;
  }
  return arrayify(v);
}

function renderArray<T extends ReactNode>(v: T | T[] | null): ReactNode {
  const arr = maybeArrayify(v);
  if (!arr) {
    return null;
  }
  return arr.map((item, index) => <Fragment key={index}>{item}</Fragment>);
}
