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
import { useEffect, useState, useCallback } from 'react';
import {
  DataGrid as DataGridMUI,
  GridColDef,
  GridPaginationModel,
  useGridApiRef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { CustomColumnMenu } from './CustomColumnMenu';
import { CustomPagination } from './CustomPagination';
import { CustomSearchToolbar } from './CustomSearchToolbar';
import { DataGridProps, GridLayout } from './types';
import { NotFound } from '../common';
import { LogoSpinner } from '../common/logoSpinner';

export function DataGrid<T extends GridValidRowModel>({
  // Required props
  tableKey,
  columns: propColumns,
  rows: propRows,

  // Optional configuration
  dataLabel = 'items',
  searchBarPlaceHolder = 'Search',
  features = {},
  styling = {},

  // Pagination
  initialPageSize = 20,
  pageSizeOptions = [20, 50, 100],

  // Event handlers
  onRowClick,
  onSelectionChange,

  // Custom components
  customFilters,
  columnVisibility,

  // Loading state
  loading,

  // custom Row ID
  getRowId,

  // Initial Table state
  initialState,
}: DataGridProps<T>) {
  const theme = useTheme();
  const apiRef = useGridApiRef();

  // Default feature flags
  const {
    quickSearch = true,
    columnPinning = true,
    columnReordering = true,
    customPagination = true,
    columnMenu = true,
    persistLayout = true,
  } = features;

  // Default styling
  const {
    borderRadius = '12px',
    headerBackgroundColor = theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.grey[100],
    backgroundColor = theme.palette.background.paper,
    height = 'auto',
  } = styling;

  const [columns, setColumns] = useState<GridColDef<T>[]>(propColumns);
  const [pinned, setPinned] = useState<string[]>([]);
  const [dragCol, setDragCol] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<'left' | 'right' | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize,
  });

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(columnVisibility || {});

  // Load saved layout
  useEffect(() => {
    if (!persistLayout) return;

    try {
      const saved = localStorage.getItem(`apiiro-gridLayout-${tableKey}`);
      if (saved) {
        const {
          order,
          pinned: savedPinned,
          columnVisibility: savedVisibility,
        } = JSON.parse(saved) as GridLayout;
        setPinned(savedPinned || []);

        // Restore column visibility if saved
        if (savedVisibility) {
          setColumnVisibilityModel(savedVisibility);
        }

        const orderedColumns = order
          .map(field => propColumns.find(c => c.field === field))
          .filter((c): c is GridColDef<T> => !!c);
        setColumns(orderedColumns);
      }
    } catch (error) {
      // Failed to load grid layout - using default
    }
  }, [propColumns, persistLayout, tableKey]);

  const saveLayout = useCallback(
    (
      cols: GridColDef<T>[],
      pinnedCols: string[],
      visibility?: Record<string, boolean>,
    ) => {
      if (!persistLayout) return;

      const layout: GridLayout = {
        order: cols.map(c => c.field),
        pinned: pinnedCols,
        columnVisibility: visibility || columnVisibilityModel,
      };
      localStorage.setItem(
        `apiiro-gridLayout-${tableKey}`,
        JSON.stringify(layout),
      );
    },
    [persistLayout, tableKey, columnVisibilityModel],
  );

  // Save column visibility changes to gridLayout
  useEffect(() => {
    if (persistLayout) {
      saveLayout(columns, pinned, columnVisibilityModel);
    }
  }, [columnVisibilityModel, persistLayout, saveLayout, columns, pinned]);

  const handleDragStart = (field: string) => setDragCol(field);

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    targetField: string,
  ) => {
    e.preventDefault();
    if (dragCol === targetField) return;
    const targetRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - targetRect.left;
    setDropTarget(targetField);
    setDropSide(x < targetRect.width / 2 ? 'left' : 'right');
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (targetField: string) => {
    if (!dragCol || dragCol === targetField) return;

    const dragIsPinned = pinned.includes(dragCol);
    const targetIsPinned = pinned.includes(targetField);

    if (dragIsPinned !== targetIsPinned) {
      setDragCol(null);
      setDropTarget(null);
      return;
    }

    const currentList = dragIsPinned
      ? columns.filter(c => pinned.includes(c.field))
      : columns.filter(c => !pinned.includes(c.field));

    const dragIndex = currentList.findIndex(c => c.field === dragCol);
    const targetIndex = currentList.findIndex(c => c.field === targetField);

    const newIndex = dropSide === 'left' ? targetIndex : targetIndex + 1;
    const reordered = [...currentList];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const finalColumns = dragIsPinned
      ? [...reordered, ...columns.filter(c => !pinned.includes(c.field))]
      : [...columns.filter(c => pinned.includes(c.field)), ...reordered];

    setColumns(finalColumns);
    setDragCol(null);
    setDropTarget(null);
    saveLayout(finalColumns, pinned);
  };

  const togglePin = useCallback(
    (field: string) => {
      setPinned(prev => {
        const next = prev.includes(field)
          ? prev.filter(f => f !== field)
          : [...prev, field];
        saveLayout(columns, next);
        return next;
      });
    },
    [columns, saveLayout],
  );

  const CustomColumnMenuWithProps = useCallback(
    (props: any) => {
      return (
        <CustomColumnMenu
          {...props}
          isPinned={pinned.includes(props.colDef.field)}
          onTogglePin={togglePin}
        />
      );
    },
    [pinned, togglePin],
  );

  const CustomPaginationComponent = useCallback(
    () => (
      <CustomPagination
        onPageSizeChange={pageSize => setPaginationModel({ page: 0, pageSize })}
        pageSizeOptions={pageSizeOptions}
        dataLabel={dataLabel}
      />
    ),
    [dataLabel, pageSizeOptions],
  );

  const finalColumns = columnReordering
    ? columns.map(col => ({
        ...col,
        renderHeader: () => (
          <Box
            draggable={columnReordering}
            onDragStart={() => handleDragStart(col.field)}
            onDragOver={e => handleDragOver(e, col.field)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.field)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: columnReordering ? 'grab' : 'default',
              userSelect: 'none',
              position: 'relative',
              fontWeight:
                columnPinning && pinned.includes(col.field) ? 'bold' : 'normal',
              px: 1,
              '&::before': columnReordering
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left:
                      dropTarget === col.field && dropSide === 'left'
                        ? 0
                        : 'auto',
                    right:
                      dropTarget === col.field && dropSide === 'right'
                        ? 0
                        : 'auto',
                    width: '3px',
                    backgroundColor:
                      dropTarget === col.field
                        ? theme.palette.primary.main
                        : 'transparent',
                    transition: 'background 0.1s ease',
                  }
                : {},
            }}
          >
            {col.headerName}
          </Box>
        ),
      }))
    : columns;

  const orderedColumns = columnPinning
    ? [
        ...finalColumns
          .filter(c => pinned.includes(c.field))
          .map(col => ({ ...col, resizable: false })),
        ...finalColumns.filter(c => !pinned.includes(c.field)),
      ]
    : finalColumns;

  // Sticky offsets
  const pinnedOffsets: Record<string, number> = {};
  let leftOffset = 0;
  for (const col of orderedColumns) {
    if (pinned.includes(col.field)) {
      pinnedOffsets[col.field] = leftOffset;
      leftOffset += col.minWidth || col.width || 200;
    }
  }

  // Create pinned column styles
  const pinnedColumnStyles: Record<string, any> = {};
  if (columnPinning) {
    pinned.forEach(field => {
      pinnedColumnStyles[`& [data-field="${field}"]`] = {
        position: 'sticky',
        left: pinnedOffsets[field],
        zIndex: 9999,
        backgroundColor: backgroundColor,
        boxShadow: '2px 0 2px rgba(0,0,0,0.05)',
      };
    });
  }

  return (
    <Box
      sx={{
        height,
        width: '100%',
        overflowX: 'auto',
      }}
    >
      {quickSearch && (
        <CustomSearchToolbar
          apiRef={apiRef}
          placeholder={searchBarPlaceHolder}
          customFilters={customFilters}
        />
      )}
      <DataGridMUI
        key={tableKey}
        apiRef={apiRef}
        rows={propRows}
        columns={orderedColumns}
        initialState={{
          ...initialState,
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        disableVirtualization
        getRowId={getRowId}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={pageSizeOptions}
        onRowClick={onRowClick ? params => onRowClick(params.row) : undefined}
        onRowSelectionModelChange={
          onSelectionChange
            ? selectionModel => {
                const selectedIds = selectionModel.ids
                  ? Array.from(selectionModel.ids)
                  : [];
                const selectedRows = propRows.filter(row =>
                  selectedIds.some(
                    id =>
                      String(getRowId ? getRowId(row) : row.id) === String(id),
                  ),
                );
                onSelectionChange(selectedRows);
              }
            : undefined
        }
        slots={{
          ...(columnMenu && { columnMenu: CustomColumnMenuWithProps }),
          ...(customPagination && { pagination: CustomPaginationComponent }),
          noResultsOverlay: () => <NotFound />,
          loadingOverlay: () => (
            <Box
              display="flex"
              height="100%"
              justifyContent="center"
              alignItems="center"
            >
              <LogoSpinner />
            </Box>
          ),
        }}
        slotProps={{
          loadingOverlay: {
            variant: 'linear-progress',
            noRowsVariant: 'skeleton',
          },
          columnsManagement: {
            disableResetButton: true,
            searchInputProps: {
              type: 'text',
            },
          },
        }}
        sx={{
          backgroundColor,
          '&.MuiDataGrid-root': {
            borderRadius,
            minWidth: 'auto',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
            {
              outline: 'none',
            },
          '&.MuiDataGrid-root .MuiDataGrid-columnHeader, &.MuiDataGrid-root .MuiDataGrid-filler':
            {
              backgroundColor: headerBackgroundColor,
            },
          // Column resize line styling
          '& .MuiDataGrid-columnSeparator--resizable': {
            '&:hover': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiDataGrid-columnSeparator--resizing': {
            color: theme.palette.primary.main,
            opacity: 1,
          },
          ...pinnedColumnStyles,
        }}
      />
    </Box>
  );
}
