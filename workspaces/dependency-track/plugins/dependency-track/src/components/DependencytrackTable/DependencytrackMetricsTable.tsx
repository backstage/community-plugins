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
import React from 'react';
import { KeyCell, ValueCell } from './DataCell';
import { Table, TableColumn } from '@backstage/core-components';
import { Options } from '@material-table/core';
import { metrictypes, ProjectMetrics } from '../../api/dependencytrack-types';

const columns: TableColumn[] = [
  {
    title: 'Type',
    render: data => (
      <KeyCell keyvaluePair={data as { key: string; value: number }} />
    ),
  },
  {
    title: 'Count',
    render: data => (
      <ValueCell keyvaluePair={data as { key: string; value: number }} />
    ),
  },
];

type DependencytrackMetricsTableProps = {
  projectMetrics?: ProjectMetrics;
  tableOptions?: Options<{}>;
};

const kv = (obj: { [k: string]: number }) =>
  metrictypes.reduce((acc, key: string) => {
    const value: number = obj[key];
    acc.push({ key, value });
    return acc;
  }, [] as unknown as Array<{ key: string; value: number }>);

const DependencytrackMetricsTable = ({
  projectMetrics,
  tableOptions,
}: DependencytrackMetricsTableProps) => {
  if (!projectMetrics) {
    throw new Error('Failed rendering table');
  }
  return (
    <Table
      columns={columns}
      options={tableOptions}
      title="Dependencytrack Metrics"
      data={kv(projectMetrics)}
    />
  );
};

export default DependencytrackMetricsTable;
