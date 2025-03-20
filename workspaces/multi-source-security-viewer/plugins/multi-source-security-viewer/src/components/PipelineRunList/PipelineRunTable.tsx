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
import { PipelineRunTableColumns } from './PipelineRunTableColumns';
import { PipelineRunTableBody } from './PipelineRunTableBody';
import { EmptyStateSpinner } from '../EmptyState/EmptyStateSpinner';
import { EmptyStateNoData } from '../EmptyState/EmptyStateNoData';
import { Table } from '@material-ui/core';
import { PipelineRunResult } from '../../models/pipelineRunResult';
import { EmptyStateNoMatchFound } from '../EmptyState/EmptyStateNoMatch';

type PipelineRunTableProps = {
  data: PipelineRunResult[] | null;
  filterInput: string;
  filterClearAction: () => void;
  isLoading: boolean;
  error: Error | null;
};

export const PipelineRunTable = ({
  data,
  filterInput,
  filterClearAction,
  isLoading,
  error,
}: PipelineRunTableProps) => {
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <EmptyStateSpinner />;
  }

  if (data?.length === 0 && filterInput) {
    return <EmptyStateNoMatchFound actionFn={filterClearAction} />;
  }

  if (data?.length === 0) {
    return <EmptyStateNoData />;
  }

  return (
    <Table>
      <PipelineRunTableColumns />
      <PipelineRunTableBody data={data} />
    </Table>
  );
};
