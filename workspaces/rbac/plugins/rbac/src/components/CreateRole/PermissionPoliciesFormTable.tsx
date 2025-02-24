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
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { PermissionsData } from '../../types';
import { ConditionRulesData, ConditionsData } from '../ConditionalAccess/types';
import PermissionPoliciesFormRow from './PermissionPoliciesFormRow';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

interface PermissionPoliciesTableToolbarProps {
  numSelected: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const PermissionPoliciesFormTableToolbar = ({
  numSelected,
  search,
  setSearch,
}: PermissionPoliciesTableToolbarProps) => {
  return (
    <Toolbar
      sx={{
        p: [4, 0, 2, 2],
      }}
    >
      <Typography
        sx={{
          flex: '1 1 100%',
          fontWeight: theme => theme.typography.fontWeightBold,
        }}
        variant="h5"
        id="tableTitle"
        component="div"
      >
        {numSelected > 0 ? `${numSelected} plugins` : 'No plugins selected'}
      </Typography>

      <TextField
        sx={{ width: '30%' }}
        id="input-with-icon-textfield"
        placeholder="Search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={() => setSearch('')}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        variant="standard"
      />
    </Toolbar>
  );
};

const PermissionPoliciesFormTable = ({
  selectedPluginsCount,
  data,
  permissionPoliciesRows,
  conditionRulesData,
  onSelectPermission,
  onSelectPolicy,
  onRemovePermission,
  onRemovePlugin,
  onAddConditions,
}: {
  selectedPluginsCount: number;
  data: any;
  permissionPoliciesRows: PermissionsData[];
  conditionRulesData?: ConditionRulesData;
  onRemovePermission: (index: number) => void;
  onSelectPermission: (
    plugin: string,
    permission: string,
    isResourced: boolean,
    policies: string[],
    resourceType?: string,
  ) => void;
  onSelectPolicy: (
    isChecked: boolean,
    policyIndex: number,
    pIndex: number,
  ) => void;
  onRemovePlugin: (plugin: string) => void;
  onAddConditions: (index: number, conditions?: ConditionsData) => void;
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [filteredData, setFilteredData] = React.useState<any>([]);

  React.useEffect(() => {
    if (search)
      setFilteredData(
        data?.filter((row: any) => row.plugin.includes(search)) ?? [],
      );
    else setFilteredData(data);
  }, [search, data]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
      <PermissionPoliciesFormTableToolbar
        numSelected={selectedPluginsCount}
        search={search}
        setSearch={setSearch}
      />
      <TableContainer component={Paper} sx={{ outline: '0' }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell
                align="left"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  fontWeight: theme => theme.typography.fontWeightBold,
                }}
              >
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <ArrowDownIcon /> : <ArrowRightIcon />}
                </IconButton>
                Name
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: '60%',
                  fontWeight: theme => theme.typography.fontWeightBold,
                }}
              >
                Permission
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  width: '10%',
                  fontWeight: theme => theme.typography.fontWeightBold,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any) => (
                  <PermissionPoliciesFormRow
                    key={row.plugin}
                    rowData={row}
                    conditionRulesData={conditionRulesData}
                    permissionPoliciesRows={permissionPoliciesRows}
                    open={open}
                    onSelectPermission={onSelectPermission}
                    onSelectPolicy={onSelectPolicy}
                    onRemovePermission={onRemovePermission}
                    onRemovePlugin={onRemovePlugin}
                    setOpen={setOpen}
                    onAddConditions={onAddConditions}
                  />
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    {search && !filteredData.length
                      ? 'No records to display.'
                      : 'Selected plugins appear here.'}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        showFirstButton
        showLastButton
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default PermissionPoliciesFormTable;
