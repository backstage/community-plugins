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
import { Table, TableColumn } from '@backstage/core-components';

type Issue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
    };
    reporter: {
      displayName: string;
    };
  };
};

type DenseTableProps = {
  issues: Issue[];
};

const DenseTable = ({ issues }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Key', field: 'key' },
    { title: 'Summary', field: 'summary' },
    { title: 'Status', field: 'status' },
    { title: 'Assignee', field: 'assignee' },
    { title: 'Reporter', field: 'reporter' },
  ];

  const data = issues.map(issue => ({
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    assignee: issue.fields.assignee?.displayName,
    reporter: issue.fields.reporter.displayName,
  }));

  return (
    <Table
      title="Jira Issues"
      options={{ search: true, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export default DenseTable;
