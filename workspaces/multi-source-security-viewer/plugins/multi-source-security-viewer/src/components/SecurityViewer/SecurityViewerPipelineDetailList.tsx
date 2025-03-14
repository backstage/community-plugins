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
import { PipelineRunList } from '../PipelineRunList/PipelineRunList';
import { usePipelineDetail } from '../../hooks/usePipelineDetail';
import { ApiRef } from '@backstage/core-plugin-api';
import { MssvApi } from '../../api/mssv';

type SecurityViewerPipelineDetailListProps = {
  jobRef: string;
  apiRef: ApiRef<MssvApi>;
};

export const SecurityViewerPipelineDetailList: React.FC<
  SecurityViewerPipelineDetailListProps
> = ({ jobRef, apiRef }) => {
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [pipelineDetailRuns, totalCount, loading, error] = usePipelineDetail(
    apiRef,
    jobRef,
    page,
    pageSize,
  );

  const onUpdatePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <React.Fragment>
      <PipelineRunList
        data={pipelineDetailRuns}
        totalCount={totalCount}
        loading={loading}
        error={error}
        onUpdatePagination={onUpdatePagination}
      />
    </React.Fragment>
  );
};
