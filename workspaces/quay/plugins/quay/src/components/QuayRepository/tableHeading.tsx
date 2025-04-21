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

import { Link, Progress, TableColumn } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { securityScanComparator, vulnerabilitySummary } from '../../lib/utils';
import type { QuayTagData } from '../../types';

export const columns: TableColumn<QuayTagData>[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Security Scan',
    field: 'securityScan',
    render: (rowData: QuayTagData): ReactNode => {
      if (!rowData.securityStatus && !rowData.securityDetails) {
        return (
          <span data-testid="quay-repo-security-scan-progress">
            <Progress />
          </span>
        );
      }

      if (rowData.securityStatus === 'queued') {
        return (
          <Tooltip title="The manifest for this tag is queued to be scanned for vulnerabilities">
            <span data-testid="quay-repo-queued-for-scan">Queued</span>
          </Tooltip>
        );
      }

      if (rowData.securityStatus === 'unsupported') {
        return (
          <Tooltip title="The manifest for this tag has an operating system or package manager unsupported by Quay Security Scanner">
            <span data-testid="quay-repo-security-scan-unsupported">
              Unsupported
            </span>
          </Tooltip>
        );
      }

      const tagManifest = rowData.manifest_digest_raw;
      const retStr = vulnerabilitySummary(rowData.securityDetails);
      return (
        <Link
          data-testid={`${rowData.name}-security-scan`}
          to={`tag/${tagManifest}`}
        >
          {retStr}
        </Link>
      );
    },
    id: 'securityScan',
    customSort: (a: QuayTagData, b: QuayTagData) =>
      securityScanComparator(a, b),
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
    customSort: (a: QuayTagData, b: QuayTagData) => a.rawSize - b.rawSize,
  },
  {
    title: 'Expires',
    field: 'expiration',
    type: 'date',
    emptyValue: <i>Never</i>,
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
    type: 'string',
    customSort: (a: QuayTagData, b: QuayTagData) =>
      a.manifest_digest_raw.localeCompare(b.manifest_digest_raw),
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
