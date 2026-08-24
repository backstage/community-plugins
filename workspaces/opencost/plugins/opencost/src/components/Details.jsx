/*
 * Copyright 2023 The Backstage Authors
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

import { memo, useEffect, useState } from 'react';
import { forEach, get, reverse, round, sortBy } from 'lodash';
import { CellText, Flex, Skeleton, Table, Text } from '@backstage/ui';
import { RiServerLine, RiCpuLine } from '@remixicon/react';
import Warnings from './Warnings';
import AllocationService from '../services/allocation';
import { bytesToString, toCurrency } from '../util';
import styles from './Details.module.css';

const Details = ({
  window,
  namespace,
  controllerKind,
  controller,
  pod,
  currency,
}) => {
  const [cluster, setCluster] = useState('');
  const [node, setNode] = useState('');

  const [fetch, setFetch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (fetch) {
      setCluster('');
      setNode('');
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const filters = [];

      if (cluster) {
        filters.push({
          property: 'cluster',
          value: cluster,
        });
      }

      if (node) {
        filters.push({
          property: 'node',
          value: node,
        });
      }

      if (namespace) {
        filters.push({
          property: 'namespace',
          value: namespace,
        });
      }

      if (controllerKind) {
        filters.push({
          property: 'controllerKind',
          value: controllerKind,
        });
      }

      if (controller) {
        filters.push({
          property: 'controller',
          value: controller,
        });
      }

      if (pod) {
        filters.push({
          property: 'pod',
          value: pod,
        });
      }

      const resp = await AllocationService.fetchAllocation(window, '', {
        accumulate: true,
      });

      let data = [];
      forEach(resp.data[0], datum => {
        if (datum.name === '__idle__') {
          return;
        }

        if (!cluster) {
          setCluster(get(datum, 'properties.cluster', ''));
        }

        if (!node) {
          setNode(get(datum, 'properties.node', ''));
        }

        // TODO can we get pod, container back in properties?
        const names = datum.name.split('/');
        datum.pod = names[names.length - 2];
        datum.container = names[names.length - 1];

        datum.hours = round(get(datum, 'minutes', 0.0) / 60.0, 2);

        if (datum.hours > 0) {
          datum.cpu = round(get(datum, 'cpuCoreHours', 0.0) / datum.hours, 2);
          datum.cpuCostPerCoreHr = datum.cpuCost / (datum.cpu * datum.hours);
          if (datum.cpu === 0) {
            datum.cpuCostPerCoreHr = 0.0;
          }

          datum.ram = round(get(datum, 'ramByteHours', 0.0) / datum.hours, 2);
          const ramGiB = datum.ram / 1024 / 1024 / 1024;
          datum.ramCostPerGiBHr = datum.ramCost / (ramGiB * datum.hours);
          if (ramGiB === 0) {
            datum.ramCostPerGiBHr = 0.0;
          }
        } else {
          datum.cpu = 0.0;
          datum.cpuCostPerCoreHr = 0.0;
          datum.ram = 0.0;
          datum.ramCostPerGiBHr = 0.0;
        }

        data.push(datum);
      });

      data = reverse(sortBy(data, 'totalCost'));

      setRows(data);
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["warn"] }] */
      console.warn(
        `Error fetching details for (${controllerKind}, ${controller}):`,
        e,
      );
      setErrors([
        {
          primary: 'Error fetching details',
          secondary: `Tried fetching details for: ${namespace}, ${controllerKind}, ${controller}, ${pod}`,
        },
      ]);
    }

    setLoading(false);
    setFetch(false);
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeletonWrapper}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Flex direction="column" style={{ marginBottom: 'var(--bui-space-2)' }}>
        {cluster && (
          <Flex
            direction="row"
            style={{
              alignItems: 'center',
              gap: 'var(--bui-space-3)',
              padding: 'var(--bui-space-2) 0',
            }}
          >
            <RiServerLine size={20} />
            <Text>{cluster}</Text>
          </Flex>
        )}
        {node && (
          <Flex
            direction="row"
            style={{
              alignItems: 'center',
              gap: 'var(--bui-space-3)',
              padding: 'var(--bui-space-2) 0',
            }}
          >
            <RiCpuLine size={20} />
            <Text>{node}</Text>
          </Flex>
        )}
      </Flex>
      <Table
        columnConfig={[
          {
            id: 'container',
            label: 'Container',
            isRowHeader: true,
            cell: row => <CellText title={row.container ?? ''} />,
          },
          {
            id: 'hours',
            label: 'Hours',
            cell: row => <CellText title={String(row.hours)} />,
          },
          {
            id: 'cpu',
            label: 'CPU',
            cell: row => <CellText title={String(row.cpu)} />,
          },
          {
            id: 'cpuCostPerCoreHr',
            label: '$/(CPU*Hr)',
            cell: row => (
              <CellText title={toCurrency(row.cpuCostPerCoreHr, currency, 5)} />
            ),
          },
          {
            id: 'cpuCost',
            label: 'CPU cost',
            cell: row => (
              <CellText title={toCurrency(row.cpuCost, currency, 3)} />
            ),
          },
          {
            id: 'ram',
            label: 'RAM',
            cell: row => <CellText title={bytesToString(row.ram)} />,
          },
          {
            id: 'ramCostPerGiBHr',
            label: '$/(GiB*Hr)',
            cell: row => (
              <CellText title={toCurrency(row.ramCostPerGiBHr, currency, 5)} />
            ),
          },
          {
            id: 'ramCost',
            label: 'RAM cost',
            cell: row => (
              <CellText title={toCurrency(row.ramCost, currency, 3)} />
            ),
          },
          {
            id: 'totalCost',
            label: 'Total cost',
            cell: row => (
              <CellText title={toCurrency(row.totalCost, currency, 3)} />
            ),
          },
        ]}
        data={rows.map(row => ({ ...row, id: row.container ?? row.pod }))}
        emptyState={<Text variant="body-small">No data</Text>}
      />
    </div>
  );
};

export default memo(Details);
