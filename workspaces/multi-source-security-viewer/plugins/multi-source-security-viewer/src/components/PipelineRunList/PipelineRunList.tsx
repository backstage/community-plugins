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
import type { FC } from 'react';

import { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { debounce } from 'lodash';
import { PipelineRunTable } from './PipelineRunTable';
import { PipelineRunToolbar } from './PipelineRunToolbar';
import { Box } from '@material-ui/core';
import { PipelineRunResult } from '../../models/pipelineRunResult';

type PipelineRunListProps = {
  data: PipelineRunResult[] | null;
  totalCount: number;
  loading: boolean;
  error: Error | null;
  onUpdatePagination: (start: number, end: number) => void;
};

export const PipelineRunList: FC<PipelineRunListProps> = ({
  data,
  totalCount,
  loading,
  error,
  onUpdatePagination,
}) => {
  const [namefilter, setNameFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [count, setCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    onUpdatePagination(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0); // Set to zero when changing the number of rows
    onUpdatePagination(0, page * rows + rows);
  };

  const filteredData = useMemo(() => {
    return data?.filter((row: PipelineRunResult) =>
      row?.id?.toString().toLocaleLowerCase().includes(namefilter),
    );
  }, [data, namefilter]);

  const onSearch = debounce((n: string) => {
    setNameFilter(n);
  });

  const filterClearAction = () => {
    onSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!loading) {
      // Keep count while fetching paginated data
      setCount(prev => (totalCount > 0 ? totalCount : prev));
    }
  }, [loading, totalCount]);

  return (
    <Fragment>
      <Box>
        <Box>
          <PipelineRunToolbar
            onSearch={onSearch}
            searchInputRef={searchInputRef}
            totalCount={totalCount > 0 ? totalCount : count} // Initial count
            page={page}
            rowSize={[5, 10, 20]}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>
        <Box>
          <PipelineRunTable
            data={filteredData ?? []}
            filterInput={namefilter}
            filterClearAction={filterClearAction}
            isLoading={loading}
            error={error}
          />
        </Box>
      </Box>
    </Fragment>
  );
};
