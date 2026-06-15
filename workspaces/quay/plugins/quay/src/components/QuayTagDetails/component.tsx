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
import { Flex, Text } from '@backstage/ui';

import { RiAlertLine, RiArrowLeftLine, RiLinkM } from '@remixicon/react';

import { SEVERITY_COLORS } from '../../lib/utils';
import {
  Layer,
  Vulnerability,
  VulnerabilityListItem,
  VulnerabilityOrder,
} from '../../types';
import styles from './QuayTagDetails.module.css';

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
        <Flex align="center">
          {rowData.Name}
          {rowData.Link.trim().length > 0 ? (
            <Link to={getVulnerabilityLink(rowData.Link)}>
              <RiLinkM size={16} style={{ marginLeft: 'var(--bui-space-2)' }} />
            </Link>
          ) : null}
        </Flex>
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
        <Flex align="center">
          <RiAlertLine
            className={styles.severityIcon}
            color={SEVERITY_COLORS[rowData.Severity]}
            size={20}
          />
          <span>{rowData.Severity}</span>
        </Flex>
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

export const QuayTagDetails = ({
  layer,
  rootLink,
  digest,
}: QuayTagDetailsProps) => {
  const vulnerabilities = layer.Features.filter(
    feat => typeof feat.Vulnerabilities !== 'undefined',
  )
    .map(feature => {
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
    <>
      <Flex align="center" mb="4">
        <Link to={rootLink()}>
          <Flex align="center" gap="2">
            <RiArrowLeftLine size={20} />
            <Text variant="body-medium">Back to repository</Text>
          </Flex>
        </Link>
      </Flex>
      <Table
        title={`Vulnerabilities for ${digest.substring(0, 17)}`}
        data={vulnerabilities}
        columns={columns}
      />
    </>
  );
};

export default QuayTagDetails;
