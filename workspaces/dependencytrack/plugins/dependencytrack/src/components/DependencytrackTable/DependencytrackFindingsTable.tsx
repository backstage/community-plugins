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
import { StringCell, LinkCell } from './DataCell';
import { Table, TableColumn } from '@backstage/core-components';
import { Options } from '@material-table/core';
import { Finding } from '../../api/dependencytrack-types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

const getComponentUrl = (finding: Finding) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return `${useApi(configApiRef).getString(
    'dependencytrack.baseUrl',
  )}/components/${finding.component.uuid}`;
};

const defineSeverityScore = (finding: Finding) => {
  if (finding.vulnerability.cvssV3BaseScore) {
    return finding.vulnerability.cvssV3BaseScore;
  } else if (finding.vulnerability.cvssV2BaseScore) {
    return finding.vulnerability.cvssV2BaseScore;
  }
  return '-';
};

const columns: TableColumn[] = [
  {
    title: 'Dependency',
    render: data => (
      <LinkCell
        url={getComponentUrl(data as Finding)}
        text={(data as Finding).component.name}
      />
    ),
  },
  {
    title: 'Name',
    render: data => (
      <StringCell text={(data as Finding).vulnerability.cweName} />
    ),
  },
  {
    title: 'Version',
    render: data => <StringCell text={(data as Finding).component.version} />,
  },
  {
    title: 'Severity',
    render: data => (
      <StringCell text={(data as Finding).vulnerability.severity.toString()} />
    ),
  },
  {
    title: 'Score',
    render: data => (
      <StringCell text={defineSeverityScore(data as Finding).toString()} />
    ),
  },
  {
    title: 'Vulnerability',
    render: data => (
      <StringCell text={(data as Finding).vulnerability.vulnId} />
    ),
  },
];

type DependencytrackFindingsTableProps = {
  findings?: Finding[];
  tableOptions: Options<{}>;
};

const DependencytrackFindingsTable = ({
  findings,
  tableOptions,
}: DependencytrackFindingsTableProps) => {
  if (!findings) {
    throw new Error('Failed rendering table');
  }
  return (
    <Table
      columns={columns}
      options={tableOptions}
      title="Dependencytrack Findings"
      data={findings}
    />
  );
};

export default DependencytrackFindingsTable;
