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
