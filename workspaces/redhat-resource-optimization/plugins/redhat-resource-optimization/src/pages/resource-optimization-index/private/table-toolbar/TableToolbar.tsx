/*
 * Copyright 2024 The Backstage Authors
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
import React, { MutableRefObject, useCallback } from 'react';
import { MTableToolbar } from '@material-table/core';
import { withStyles } from '@material-ui/core/styles';

const StyledMTableToolbar = withStyles(
  theme => ({
    root: {
      padding: theme.spacing(3, 0, 2.5, 2.5),
    },
    title: {
      '& > h6': {
        fontWeight: theme.typography.fontWeightBold,
      },
    },
    searchField: {
      paddingRight: theme.spacing(2),
    },
  }),
  { name: 'ResourceOptimizationTableToolbar' },
)(MTableToolbar);

/**
 * Props for {@link TableToolbar}.
 *
 * @public
 */
export interface TableToolbarProps {
  toolbarRef: MutableRefObject<any>;
  setSearch: (value: string) => void;
  onSearchChanged: (value: string) => void;
  toggleFilters: () => void;
  selectedFiltersLength: number;
  showFiltersButton: boolean;
}

/**
 * Used to override `@backstage/core-components` Table's toolbar.
 *
 * @remarks
 *
 * The Table's built-in toolbar displays a "Filters" button to show or hide the table's filters.
 * This button becomes redundant when the table's initial state is set to
 * `{ filtersOpen: true }` which indicates the filters should always be visible.
 *
 * @public
 */
export function TableToolbar(toolbarProps: TableToolbarProps) {
  const { toolbarRef, onSearchChanged } = toolbarProps;
  const handleSearchChanged = useCallback(
    (searchText: string) => {
      onSearchChanged(searchText);
    },
    [onSearchChanged],
  );

  return (
    <StyledMTableToolbar
      {...toolbarProps}
      ref={toolbarRef}
      onSearchChanged={handleSearchChanged}
    />
  );
}
