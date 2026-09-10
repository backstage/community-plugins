/*
 * Copyright 2021 The Backstage Authors
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

import {
  ErrorPanel,
  Link,
  Progress,
  StatusError,
  StatusOK,
  Table,
  TableColumn,
  WarningPanel,
} from '@backstage/core-components';
import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import { Box, Flex, Switch } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { apacheAirflowApiRef } from '../../api';
import { Dag } from '../../api/types';
import { ScheduleIntervalLabel } from '../ScheduleIntervalLabel';
import { LatestDagRunsStatus } from '../LatestDagRunsStatus';
import styles from './DagTableComponent.module.css';

type DagTableRow = Dag & {
  id: string;
  dagUrl: string;
};

type DenseTableProps = {
  dags: Dag[];
  rowClick: (rowData: Dag) => void;
};

export const DenseTable = ({ dags, rowClick }: DenseTableProps) => {
  const storage = useApi(storageApiRef);
  const hiddenColumnsKey = 'dag-table-hidden-columns';
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  useEffect(() => {
    const hiddenState = storage.snapshot(hiddenColumnsKey);
    if (hiddenState.presence === 'present') {
      setHiddenColumns(hiddenState.value as string[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableColumn[] = [
    {
      title: 'Paused',
      field: 'is_paused',
      render: (row: Partial<DagTableRow>) => (
        <Switch
          className={styles.pausedSwitch}
          aria-label="Pause/Unpause DAG"
          isSelected={!row.is_paused}
          onChange={() => rowClick(row as Dag)}
        />
      ),
      width: '5%',
      hidden: hiddenColumns.some(field => field === 'is_paused'),
    },
    {
      title: 'DAG',
      field: 'id',
      render: (row: Partial<DagTableRow>) => (
        <Box className={styles.dagCell}>
          <Box className={styles.dagName}>{row.id}</Box>
          <Box className={styles.tagGroup}>
            {row.tags?.map((tag, ix) => (
              <Box key={ix} className={styles.pill}>
                {tag.name}
              </Box>
            ))}
          </Box>
        </Box>
      ),
      width: '50%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'id'),
    },
    {
      title: 'Runs',
      field: 'runs',
      render: (row: Partial<DagTableRow>) => (
        <LatestDagRunsStatus dagId={row.dag_id || ''} />
      ),
      width: '10%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'runs'),
    },
    {
      title: 'Owner',
      field: 'owners',
      render: (row: Partial<DagTableRow>) => (
        <Box className={styles.tagGroup}>
          {row.owners?.map((owner, ix) => (
            <Box key={ix} className={styles.pill}>
              {owner}
            </Box>
          ))}
        </Box>
      ),
      width: '10%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'owners'),
    },
    {
      title: 'Active',
      field: 'active',
      render: (row: Partial<DagTableRow>) => (
        <Flex align="center" className={styles.statusCell}>
          {row.is_active ? <StatusOK /> : <StatusError />}
          <Box className={styles.activeLabel}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Box>
        </Flex>
      ),
      width: '10%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'active'),
    },
    {
      title: 'Schedule',
      field: 'schedule',
      render: (row: Partial<DagTableRow>) => (
        <ScheduleIntervalLabel interval={row.schedule_interval} />
      ),
      width: '10%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'schedule'),
    },
    {
      title: 'Link',
      field: 'dagUrl',
      render: (row: Partial<DagTableRow>) =>
        !row.dagUrl ? null : (
          <Link
            to={row.dagUrl}
            className={styles.linkButton}
            aria-label="details"
          >
            <RiExternalLinkLine size={18} />
          </Link>
        ),
      width: '5%',
      disableClick: true,
      hidden: hiddenColumns.some(field => field === 'dagUrl'),
    },
  ];

  return (
    <Table
      title="DAGs"
      options={{ pageSize: 5, columnsButton: true }}
      columns={columns}
      data={dags}
      onChangeColumnHidden={(column, hidden) => {
        if (column.field) {
          let newHiddenColumns: string[];
          if (hidden) {
            newHiddenColumns = hiddenColumns.concat(column.field);
          } else {
            newHiddenColumns = hiddenColumns.filter(v => v !== column.field);
          }
          setHiddenColumns(newHiddenColumns);
          storage.set(hiddenColumnsKey, newHiddenColumns);
        }
      }}
    />
  );
};

type DagTableComponentProps = {
  dagIds?: string[];
};

export const DagTableComponent = (props: DagTableComponentProps) => {
  const { dagIds } = props;
  const [dagsData, setDagsData] = useState<DagTableRow[]>([]);
  const apiClient = useApi(apacheAirflowApiRef);

  const updatePaused = async (rowData: Dag): Promise<Dag> => {
    const newDag = await apiClient.updateDag(
      rowData.dag_id,
      !rowData.is_paused,
    );

    const newDags = dagsData.map(el => {
      if (el.dag_id === newDag.dag_id) {
        return { ...el, is_paused: newDag.is_paused };
      }
      return el;
    });

    setDagsData(newDags);
    return newDag;
  };

  const { value, loading, error } = useAsync(async (): Promise<
    DagTableRow[]
  > => {
    let dags: Dag[] = [];
    if (dagIds) {
      dags = (await apiClient.getDags(dagIds)).dags;
    } else {
      dags = await apiClient.listDags();
    }
    return dags.map(el => ({
      ...el,
      id: el.dag_id, // table records require `id` attribute
      dagUrl: `${apiClient.baseUrl}dag_details?dag_id=${el.dag_id}`, // construct path to DAG using `baseUrl`
    }));
  }, []);

  useEffect(() => {
    if (value) {
      setDagsData(value);
    }
  }, [value]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ErrorPanel error={error} />;
  }

  const dagsNotFound =
    dagIds && value
      ? dagIds.filter(id => !value.find(d => d.dag_id === id))
      : [];
  return (
    <>
      {dagsNotFound.length ? (
        <WarningPanel title={`${dagsNotFound.length} DAGs were not found`}>
          {dagsNotFound.map(dagId => (
            <Box key={dagId}>{dagId}</Box>
          ))}
        </WarningPanel>
      ) : null}
      <DenseTable dags={dagsData} rowClick={updatePaused} />
    </>
  );
};
