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
import type {
  GridColDef,
  GridColumnMenuProps,
  GridColumnMenuItemProps,
  GridValidRowModel,
  GridInitialState,
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';

export type { GridValidRowModel };

export interface GridLayout {
  order: string[];
  pinned: string[];
  columnVisibility?: Record<string, boolean>;
}

export interface DataGridFeatures {
  quickSearch?: boolean;
  columnPinning?: boolean;
  columnReordering?: boolean;
  customPagination?: boolean;
  columnMenu?: boolean;
  persistLayout?: boolean;
}

export interface DataGridStyling {
  borderRadius?: string;
  headerBackgroundColor?: string;
  backgroundColor?: string;
  height?: string | number;
}

export interface DataGridProps<T extends GridValidRowModel> {
  // Required props
  tableKey: string;
  columns: GridColDef<T>[];
  rows: T[];

  // Optional configuration
  dataLabel?: string;
  searchBarPlaceHolder?: string;
  features?: DataGridFeatures;
  styling?: DataGridStyling;

  // Pagination
  initialPageSize?: number;
  pageSizeOptions?: number[];

  // Event handlers
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;

  // Custom components
  customFilters?: React.ReactNode;

  // Column visibility
  columnVisibility?: Record<string, boolean>;

  // Loading state
  loading?: boolean;

  // Custom Row ID
  getRowId?: (row: T) => string | number;

  // Initial Table state
  initialState?: GridInitialState;
}

export interface CustomSearchToolbarProps {
  apiRef: React.MutableRefObject<GridApiCommunity | null>;
  placeholder: string;
  customFilters?: React.ReactNode;
}

export interface CustomPaginationProps {
  page: number;
  pageSize: number;
  rowCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  dataLabel?: string;
}

export interface CustomColumnMenuProps extends GridColumnMenuProps {
  isPinned: boolean;
  onTogglePin: (field: string) => void;
}

export interface PinColumnMenuItemProps extends GridColumnMenuItemProps {
  isPinned: boolean;
  onTogglePin: (field: string) => void;
}
