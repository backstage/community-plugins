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
import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

type LanguageStats = {
  language: string;
  totalSuggestions: number;
  totalAcceptances: number;
  acceptanceRate: number;
};

type Order = 'asc' | 'desc';

interface EnhancedTableProps {
  title?: string;
  rows: LanguageStats[];
}

const headCells = [
  { id: 'language', label: 'Language', numeric: false },
  { id: 'totalAcceptances', label: 'Accepted Prompts', numeric: true },
  { id: 'totalSuggestions', label: 'Accepted Lines of Code', numeric: true },
  { id: 'acceptanceRate', label: 'Acceptance Rate (%)', numeric: true },
];

const StyledTableContainer = styled(TableContainer)(() => ({
  flex: 1,
}));

const StyledTableWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const EnhancedTable = ({ title, rows }: EnhancedTableProps) => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] =
    React.useState<keyof LanguageStats>('totalAcceptances');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof LanguageStats,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedRows = [...rows].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * (order === 'asc' ? 1 : -1);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * (order === 'asc' ? 1 : -1);
    }

    return 0;
  });

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <StyledTableWrapper>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <StyledTableContainer>
        <Table
          aria-labelledby="tableTitle"
          size="medium"
          aria-label="enhanced table"
        >
          <TableHead>
            <TableRow>
              {headCells.map(headCell => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={event =>
                      handleRequestSort(
                        event,
                        headCell.id as keyof LanguageStats,
                      )
                    }
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map(row => (
              <TableRow hover tabIndex={-1} key={row.language}>
                <TableCell component="th" scope="row">
                  {row.language}
                </TableCell>
                <TableCell align="right">{row.totalAcceptances}</TableCell>
                <TableCell align="right">{row.totalSuggestions}</TableCell>
                <TableCell align="right">
                  {(row.acceptanceRate * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 15, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </StyledTableWrapper>
  );
};

export function LanguagesComparisonTables({
  team,
  overallRows,
  teamRows,
}: {
  team?: string;
  overallRows: LanguageStats[];
  teamRows: LanguageStats[];
}) {
  return (
    <Box display="flex" flexDirection="row" gap={4} height="100%">
      {team && (
        <Box flex={1}>
          <EnhancedTable title={team} rows={teamRows} />
        </Box>
      )}
      <Box flex={1}>
        <EnhancedTable
          title={team ? 'Overall' : undefined}
          rows={overallRows}
        />
      </Box>
    </Box>
  );
}
