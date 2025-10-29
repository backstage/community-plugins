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
import type { PropsWithChildren, MouseEvent, ChangeEvent } from 'react';

import {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';

import { InfoCard, Progress } from '@backstage/core-components';

import {
  Box,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
} from '@material-ui/core';

import {
  ComputedStatus,
  PipelineRunKind,
  pipelineRunStatus,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors, Order } from '../../types/types';
import { getComparator } from '../../utils/tekton-utils';
import { ClusterSelector, ErrorPanel } from '../common';
import { StatusSelector } from '../common/StatusSelector';
import { TableExpandCollapse } from '../common/TableExpandCollapse';
import { getPipelineRunColumnHeader } from './PipelineRunColumnHeader';
import { PipelineRunListSearchBar } from './PipelineRunListSearchBar';
import { PipelineRunTableBody } from './PipelineRunTableBody';
import { EnhancedTableHead } from './PipelineTableHeader';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type WrapperInfoCardProps = {
  allErrors?: ClusterErrors;
  showClusterSelector?: boolean;
  titleClassName?: string;
};

const useStyles = makeStyles(theme => ({
  root: {
    alignItems: 'start',
    padding: theme.spacing(3, 0, 2.5, 2.5),
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  footer: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
}));

const WrapperInfoCard = ({
  children,
  allErrors,
  showClusterSelector = true,
  titleClassName,
}: PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard
      {...(showClusterSelector && {
        title: (
          <div className={titleClassName}>
            <ClusterSelector />
            <StatusSelector />
            <TableExpandCollapse />
          </div>
        ),
      })}
    >
      {children}
    </InfoCard>
  </>
);

const PipelineRunList = () => {
  const {
    loaded,
    responseError,
    watchResourcesData,
    selectedClusterErrors,
    clusters,
    selectedCluster,
    selectedStatus,
  } = useContext(TektonResourcesContext);
  const [search, setSearch] = useState<string>('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('status.startTime');
  const [orderById, setOrderById] = useState<string>('startTime'); // 2 columns have the same field
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const { t } = useTranslationRef(tektonTranslationRef);
  const pipelineRunColumnHeader = getPipelineRunColumnHeader(t);

  // Jump to first page when cluster, status and search filter changed
  const updateStateOnFilterChanges = useRef(false);
  useEffect(() => {
    if (updateStateOnFilterChanges.current) {
      setPage(0);
    } else {
      updateStateOnFilterChanges.current = true;
    }
  }, [selectedCluster, selectedStatus, search]);

  const allPipelineRuns = useMemo(() => {
    const plrs =
      watchResourcesData?.pipelineruns?.data?.map(d => ({
        ...d,
        id: d.metadata.uid,
      })) ?? [];
    return plrs as PipelineRunKind[];
  }, [watchResourcesData]);

  const filteredPipelineRuns = useMemo(() => {
    let plrs = allPipelineRuns;

    if (selectedStatus && selectedStatus !== ComputedStatus.All) {
      plrs = plrs.filter(plr => pipelineRunStatus(plr) === selectedStatus);
    }

    if (search) {
      const f = search.toLocaleUpperCase('en-US');
      plrs = plrs.filter((plr: PipelineRunKind) => {
        const n = plr.metadata?.name?.toLocaleUpperCase('en-US');
        return n?.includes(f);
      });
    }

    plrs = plrs.sort(getComparator(order, orderBy, orderById));

    return plrs;
  }, [allPipelineRuns, selectedStatus, search, order, orderBy, orderById]);

  const visibleRows = useMemo(() => {
    return filteredPipelineRuns.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPipelineRuns, page, rowsPerPage, order, orderById]);

  const handleRequestSort = useCallback(
    (_event: MouseEvent<unknown>, property: string, id: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setOrderById(id);
    },
    [order, orderBy],
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(
          0,
          (1 + page) * rowsPerPage - (filteredPipelineRuns.length ?? 0),
        )
      : 0;

  const classes = useStyles();

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];

  if (!loaded && !responseError)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  return (
    <WrapperInfoCard
      allErrors={allErrors}
      showClusterSelector={clusters.length > 0}
      titleClassName={classes.title}
    >
      <Box>
        <Paper>
          <Toolbar>
            <Typography variant="h5" component="h2">
              {t('pipelineRunList.title')}
            </Typography>
            <PipelineRunListSearchBar value={search} onChange={setSearch} />
          </Toolbar>
          <Table
            aria-labelledby="Pipeline Runs"
            size="small"
            style={{ width: '100%' }}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              orderById={orderById}
              onRequestSort={handleRequestSort}
            />
            {visibleRows?.length > 0 ? (
              <TableBody>
                <PipelineRunTableBody rows={visibleRows} />
                {emptyRows > 0 && (
                  <TableRow style={{ height: 55 * emptyRows }}>
                    <TableCell colSpan={pipelineRunColumnHeader.length} />
                  </TableRow>
                )}
                <TableRow className={classes.footer}>
                  <TablePagination
                    rowsPerPageOptions={[
                      {
                        value: 5,
                        label: t(
                          'pipelineRunList.tablePagination.rowsPerPageOptionLabel',
                          { num: '5' },
                        ),
                      },
                      {
                        value: 10,
                        label: t(
                          'pipelineRunList.tablePagination.rowsPerPageOptionLabel',
                          { num: '10' },
                        ),
                      },
                      {
                        value: 25,
                        label: t(
                          'pipelineRunList.tablePagination.rowsPerPageOptionLabel',
                          { num: '25' },
                        ),
                      },
                    ]}
                    count={filteredPipelineRuns.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={null}
                  />
                </TableRow>
              </TableBody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={pipelineRunColumnHeader.length}>
                    <div
                      data-testid="no-pipeline-runs"
                      className={classes.empty}
                    >
                      {t('pipelineRunList.noPipelineRuns')}
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </Table>
        </Paper>
      </Box>
    </WrapperInfoCard>
  );
};

export default memo(PipelineRunList);
