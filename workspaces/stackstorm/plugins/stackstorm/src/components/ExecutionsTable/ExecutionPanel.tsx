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
import {
  CodeSnippet,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Execution, stackstormApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import { Button, Card, Table, Text } from '@backstage/ui';
import { Status } from './Status';
import styles from './ExecutionPanel.module.css';

const ExecutionCard = ({ e }: { e: Execution }) => {
  const st2 = useApi(stackstormApiRef);

  return (
    <Card className={styles.card}>
      <table className={styles.table}>
        <tbody>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Name
              </Text>
            </th>
            <td>
              <Text variant="body-small">{e.action.ref}</Text>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Status
              </Text>
            </th>
            <td>
              <Status status={e.status} />
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Execution ID
              </Text>
            </th>
            <td>
              <Text variant="body-small">{e.id}</Text>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Started
              </Text>
            </th>
            <td>
              <Text variant="body-small">
                {new Date(e.start_timestamp).toUTCString()}
              </Text>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Finished
              </Text>
            </th>
            <td>
              <Text variant="body-small">
                {new Date(e.end_timestamp).toUTCString()}
              </Text>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Execution Time
              </Text>
            </th>
            <td>
              <Text variant="body-small">
                {Math.round(e.elapsed_seconds)} s
              </Text>
            </td>
          </tr>
          <tr className={styles.tableRow}>
            <th className={styles.tableHead} scope="row">
              <Text variant="body-small" color="secondary">
                Runner
              </Text>
            </th>
            <td>
              <Text variant="body-small">{e.action.runner_type}</Text>
            </td>
          </tr>
        </tbody>
      </table>
      <Text className={styles.title}>Action Output</Text>
      <CodeSnippet
        text={JSON.stringify(e.result, null, 2)}
        language="json"
        customStyle={{ width: 800 }}
      />
      <Text className={styles.title}>Action Input</Text>
      <CodeSnippet
        text={JSON.stringify(e.parameters, null, 2)}
        language="json"
        customStyle={{ width: 800 }}
      />
      <div style={{ padding: 'var(--bui-space-2)' }}>
        <Button
          href={`${st2.getExecutionHistoryUrl(e.id)}`}
          target="_blank"
          variant="secondary"
        >
          View in ST2
        </Button>
      </div>
    </Card>
  );
};

export const ExecutionPanel = ({ id }: { id: string }) => {
  const st2 = useApi(stackstormApiRef);

  const { value, loading, error } = useAsync(async (): Promise<Execution> => {
    const data = await st2.getExecution(id);
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <ExecutionCard e={value!} />;
};
