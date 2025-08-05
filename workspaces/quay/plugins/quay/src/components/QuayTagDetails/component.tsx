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
import type { ReactNode } from 'react';

import { Link, Table, TableColumn } from '@backstage/core-components';
import type { RouteFunc } from '@backstage/core-plugin-api';

import { makeStyles, TableContainer, TableHead } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import LinkIcon from '@material-ui/icons/Link';
import WarningIcon from '@material-ui/icons/Warning';

import { SEVERITY_COLORS } from '../../lib/utils';
import {
  Layer,
  Vulnerability,
  VulnerabilityListItem,
  VulnerabilityOrder,
} from '../../types';

type QuayTagDetailsProps = {
  layer: Layer;
  digest: string;
  rootLink: RouteFunc<undefined>;
};

// from: https://github.com/quay/quay/blob/f1d85588157eababc3cbf789002c5db521dbd616/web/src/routes/TagDetails/SecurityReport/SecurityReportTable.tsx#L43
const getVulnerabilityLink = (link: string) => link.split(' ')[0];

const columns: TableColumn<VulnerabilityListItem>[] = [
  {
    title: 'Advisory',
    field: 'name',
    render: (rowData: VulnerabilityListItem): ReactNode => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rowData.Name}
          {rowData.Link.trim().length > 0 ? (
            <Link to={getVulnerabilityLink(rowData.Link)}>
              <LinkIcon style={{ marginLeft: '0.5rem' }} />
            </Link>
          ) : null}
        </div>
      );
    },
    customSort: (a: VulnerabilityListItem, b: VulnerabilityListItem) =>
      a.Name.localeCompare(b.Name, 'en'),
  },
  {
    title: 'Severity',
    field: 'Severity',
    customSort: (a: VulnerabilityListItem, b: VulnerabilityListItem) => {
      const severityA = VulnerabilityOrder[a.Severity];
      const severityB = VulnerabilityOrder[b.Severity];

      return severityA - severityB;
    },
    render: (rowData: VulnerabilityListItem): ReactNode => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon
            htmlColor={SEVERITY_COLORS[rowData.Severity]}
            style={{
              marginRight: '0.5rem',
            }}
          />
          <span>{rowData.Severity}</span>
        </div>
      );
    },
  },
  {
    title: 'Package Name',
    field: 'PackageName',
    type: 'string',
  },
  {
    title: 'Current Version',
    field: 'CurrentVersion',
    type: 'string',
  },
  {
    title: 'Fixed By',
    field: 'FixedBy',
    render: (rowData: VulnerabilityListItem): ReactNode => {
      return (
        <>
          {rowData.FixedBy.length > 0 ? (
            <span>{rowData.FixedBy}</span>
          ) : (
            '(None)'
          )}
        </>
      );
    },
  },
];

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: '0.5rem',
    fontSize: '1.1rem',
  },
  tableHead: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
});

export const QuayTagDetails = ({
  layer,
  rootLink,
  digest,
}: QuayTagDetailsProps) => {
  const classes = useStyles();
  const vulnerabilities = layer.Features.filter(
    feat => typeof feat.Vulnerabilities !== 'undefined',
  )
    .map(feature => {
      // TS doesn't seem to register this list as never being undefined from the above filter
      // so we cast it into the list
      // NOSONAR - irrelevant as per above comment
      return (feature.Vulnerabilities as Vulnerability[]).map(
        (v: Vulnerability): VulnerabilityListItem => {
          return {
            ...v,
            PackageName: feature.Name,
            CurrentVersion: feature.Version,
          };
        },
      );
    })
    .flat()
    .sort((a, b) => {
      const severityA = VulnerabilityOrder[a.Severity];
      const severityB = VulnerabilityOrder[b.Severity];

      return severityA - severityB;
    });

  return (
    <TableContainer>
      <TableHead className={classes.tableHead}>
        <Link to={rootLink()} className={classes.link}>
          <KeyboardBackspaceIcon />
          <span className={classes.linkText}>Back to repository</span>
        </Link>
      </TableHead>
      <Table
        title={`Vulnerabilities for ${digest.substring(0, 17)}`}
        data={vulnerabilities}
        columns={columns}
      />
    </TableContainer>
  );
};

export default QuayTagDetails;
