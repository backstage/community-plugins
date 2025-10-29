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
import type { SetStateAction, Dispatch, ChangeEvent } from 'react';

import { useState, useEffect } from 'react';
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
import { useTranslation } from '../../hooks/useTranslation';

interface PermissionPoliciesTableToolbarProps {
  numSelected: number;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

const PermissionPoliciesFormTableToolbar = ({
  numSelected,
  search,
  setSearch,
}: PermissionPoliciesTableToolbarProps) => {
  const { t } = useTranslation();

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
        {numSelected > 0
          ? t('permissionPolicies.pluginsSelected' as any, {
              count: `${numSelected}`,
            })
          : t('permissionPolicies.noPluginsSelected')}
      </Typography>

      <TextField
        sx={{ width: '30%' }}
        id="input-with-icon-textfield"
        placeholder={t('permissionPolicies.search')}
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
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any>([]);

  useEffect(() => {
    if (search)
      setFilteredData(
        data?.filter((row: any) => row.plugin.includes(search)) ?? [],
      );
    else setFilteredData(data);
  }, [search, data]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
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
                {t('common.name')}
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: '60%',
                  fontWeight: theme => theme.typography.fontWeightBold,
                }}
              >
                {t('permissionPolicies.permission')}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  width: '10%',
                  fontWeight: theme => theme.typography.fontWeightBold,
                }}
              >
                {t('common.actions')}
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
                      ? t('permissionPolicies.noRecordsToDisplay')
                      : t('permissionPolicies.selectedPluginsAppearHere')}
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
