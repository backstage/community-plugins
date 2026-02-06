/*
 * Copyright 2026 The Backstage Authors
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

import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import { useFairwindsInsightsApi } from '../../api';
import {
  SEVERITY_COLORS,
  type ActionItemRow,
} from '@backstage-community/plugin-fairwinds-insights-common';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import { visuallyHidden } from '@mui/utils';
import { useEffect, useState } from 'react';
import Link from '@mui/material/Link';

type Order = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

const TABLE_COLUMNS = [
  { id: 'title', label: 'Title', defaultVisible: true },
  { id: 'severity', label: 'Severity', defaultVisible: true },
  { id: 'category', label: 'Category', defaultVisible: true },
  { id: 'report', label: 'Report', defaultVisible: true },
  { id: 'cluster', label: 'Cluster', defaultVisible: true },
  { id: 'name', label: 'Name', defaultVisible: true },
  { id: 'namespace', label: 'Namespace', defaultVisible: true },
  { id: 'container', label: 'Container', defaultVisible: true },
  { id: 'labels', label: 'Labels', defaultVisible: false },
  { id: 'annotations', label: 'Annotations', defaultVisible: false },
] as const;

const COLUMN_ID_TO_ORDER_BY: Record<string, string> = {
  title: 'Title',
  severity: 'Severity',
  category: 'Category',
  report: 'Report',
  cluster: 'Cluster',
  name: 'Name',
  namespace: 'Namespace',
  container: 'Container',
  labels: 'Labels',
  annotations: 'Annotations',
};

function orderByParam(orderByColumnId: string, order: Order): string {
  const field = COLUMN_ID_TO_ORDER_BY[orderByColumnId] ?? 'Title';
  return `${field}.${order}`;
}

const defaultColumnVisibility: Record<string, boolean> = Object.fromEntries(
  TABLE_COLUMNS.map(c => [c.id, c.defaultVisible]),
);

export const ActionItemsCard = () => {
  const { entity } = useEntity();
  const api = useFairwindsInsightsApi();

  const appGroupsAnnotation =
    entity.metadata.annotations?.['insights.fairwinds.com/app-groups'];
  const appGroupsSpec =
    (entity.spec as any)?.['app-groups'] || (entity.spec as any)?.['app-group'];
  const appGroupsValue = appGroupsAnnotation || appGroupsSpec;
  const appGroups = appGroupsValue
    ? appGroupsValue
        .split(',')
        .map((g: string) => g.trim())
        .filter((g: string) => g.length > 0)
    : [];

  const entityRef = stringifyEntityRef(entity);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('severity');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [columnVisibility, setColumnVisibility] = useState(() => ({
    ...defaultColumnVisibility,
  }));
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLButtonElement | null>(
    null,
  );

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { value: filtersValue } = useAsync(async () => {
    if (appGroups.length === 0) return null;
    return api.getActionItemFilters(entityRef, { field: 'ReportType' });
  }, [entityRef, appGroups.join(',')]);

  const reportTypeOptions = filtersValue?.ReportType ?? [];

  const {
    value: listValue,
    loading: listLoading,
    error: listError,
  } = useAsync(async () => {
    if (appGroups.length === 0) return null;
    return api.getActionItemsList(entityRef, {
      page,
      pageSize,
      orderBy: orderByParam(orderBy, order),
      search: searchDebounced || undefined,
      reportType: reportType || undefined,
    });
  }, [
    entityRef,
    appGroups.join(','),
    page,
    pageSize,
    order,
    orderBy,
    searchDebounced,
    reportType,
  ]);

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  if (appGroups.length === 0) {
    return (
      <InfoCard title="Action Items">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (listError) {
    return (
      <InfoCard title="Action Items">
        <ResponseErrorPanel error={listError} />
      </InfoCard>
    );
  }

  const data = listValue?.data ?? [];
  const total = listValue?.total ?? 0;
  const hasFilters = Boolean(searchDebounced || reportType);
  const emptyMessage = hasFilters
    ? 'No results match your filters'
    : 'No action items available';
  const visibleColumnCount = TABLE_COLUMNS.filter(
    c => columnVisibility[c.id] !== false,
  ).length;

  return (
    <InfoCard
      title="Action Items"
      action={
        listValue?.insightsUrl && (
          <Link
            href={listValue.insightsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Insights
          </Link>
        )
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            label="Search"
            placeholder="Search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 240 }}
            inputProps={{ 'aria-label': 'Search action items' }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="report-type-label">Report type</InputLabel>
            <Select
              labelId="report-type-label"
              label="Report type"
              value={reportType}
              onChange={e => {
                setReportType(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All types</MenuItem>
              {reportTypeOptions.map(rt => (
                <MenuItem key={rt} value={rt}>
                  {rt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={e => setColumnsAnchor(e.currentTarget)}
            aria-label="Toggle column visibility"
          >
            Columns ({visibleColumnCount}/{TABLE_COLUMNS.length})
          </Button>
          <Popover
            open={Boolean(columnsAnchor)}
            anchorEl={columnsAnchor}
            onClose={() => setColumnsAnchor(null)}
          >
            <Box
              sx={{
                p: 2,
                minWidth: 180,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <FormGroup>
                {TABLE_COLUMNS.map(({ id, label }) => (
                  <FormControlLabel
                    key={id}
                    control={
                      <Checkbox
                        size="small"
                        checked={columnVisibility[id] ?? true}
                        onChange={(_, checked) =>
                          setColumnVisibility(prev => ({
                            ...prev,
                            [id]: checked,
                          }))
                        }
                      />
                    }
                    label={label}
                  />
                ))}
              </FormGroup>
            </Box>
          </Popover>
        </Box>

        <TableContainer sx={{ overflowX: 'auto', position: 'relative' }}>
          {listLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                zIndex: 1,
              }}
            >
              <Progress />
            </Box>
          )}
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {TABLE_COLUMNS.map(
                  col =>
                    columnVisibility[col.id] !== false && (
                      <TableCell
                        key={col.id}
                        sortDirection={orderBy === col.id ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={e => handleRequestSort(e, col.id)}
                        >
                          {col.label}
                          {orderBy === col.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc'
                                ? 'sorted descending'
                                : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                    ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount || 1} align="center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row: ActionItemRow) => (
                  <TableRow key={row.id}>
                    {columnVisibility.title !== false && (
                      <TableCell>{row.title}</TableCell>
                    )}
                    {columnVisibility.severity !== false && (
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.severity}
                          sx={{
                            backgroundColor:
                              SEVERITY_COLORS[row.severity] ?? undefined,
                            color: row.severity ? '#fff' : undefined,
                          }}
                        />
                      </TableCell>
                    )}
                    {columnVisibility.category !== false && (
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.category}
                          variant="outlined"
                        />
                      </TableCell>
                    )}
                    {columnVisibility.report !== false && (
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.report}
                          variant="outlined"
                        />
                      </TableCell>
                    )}
                    {columnVisibility.cluster !== false && (
                      <TableCell>{row.cluster}</TableCell>
                    )}
                    {columnVisibility.name !== false && (
                      <TableCell>{row.name}</TableCell>
                    )}
                    {columnVisibility.namespace !== false && (
                      <TableCell>{row.namespace}</TableCell>
                    )}
                    {columnVisibility.container !== false && (
                      <TableCell>{row.container}</TableCell>
                    )}
                    {columnVisibility.labels !== false && (
                      <TableCell sx={{ maxWidth: 200 }} title={row.labels}>
                        {row.labels || '—'}
                      </TableCell>
                    )}
                    {columnVisibility.annotations !== false && (
                      <TableCell sx={{ maxWidth: 200 }} title={row.annotations}>
                        {row.annotations || '—'}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={e => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            '& .v5-MuiTablePagination-actions': {
              display: 'flex',
            },
          }}
        />
      </Box>
    </InfoCard>
  );
};
