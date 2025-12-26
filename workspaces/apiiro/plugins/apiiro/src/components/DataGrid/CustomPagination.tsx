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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import { useTheme } from '@mui/material/styles';
import {
  useGridApiContext,
  useGridSelector,
  gridFilteredTopLevelRowCountSelector,
  gridPaginationModelSelector,
} from '@mui/x-data-grid';
import { CustomPaginationProps } from './types';

export function CustomPagination({
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  dataLabel = 'items',
}: Omit<
  CustomPaginationProps,
  'page' | 'pageSize' | 'rowCount' | 'onPageChange'
>) {
  const theme = useTheme();
  const apiRef = useGridApiContext();

  // Use DataGrid selectors to get current state
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const filteredRowCount = useGridSelector(
    apiRef,
    gridFilteredTopLevelRowCountSelector,
  );

  const { page, pageSize } = paginationModel;
  const totalPages = Math.ceil(filteredRowCount / pageSize);
  const startRow = filteredRowCount === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, filteredRowCount);

  const handlePageChange = (newPage: number) => {
    apiRef.current.setPage(newPage);
  };

  const handlePageSizeChange = (event: any) => {
    onPageSizeChange(Number(event.target.value));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: theme.palette.background.paper,
        minHeight: '52px',
      }}
    >
      {/* Left side - Pagination */}
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(_, newPage) => handlePageChange(newPage - 1)}
        defaultPage={1}
        sx={{
          '& .MuiPaginationItem-root': {
            fontSize: '0.875rem',
          },
        }}
      />

      {/* Center - Per page dropdown */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginRight: '10px',
          marginLeft: '4px',
        }}
      >
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          sx={{
            borderRadius: '100vmax',
            margin: '0',
            minWidth: '80px',
            '& .MuiSelect-select': {
              padding: '4px 8px',
              fontSize: '0.875rem',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: 3,
              },
            },
          }}
        >
          {pageSizeOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option} per page
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Right side - Row count info */}
      <Typography variant="body2" color="text.secondary">
        {startRow}-{endRow} of {filteredRowCount.toLocaleString()} {dataLabel}
      </Typography>
    </Box>
  );
}
