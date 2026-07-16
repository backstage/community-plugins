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
import { Button, Card, CardBody, CardFooter, Text } from '@backstage/ui';
import { Status } from './Status';
import styles from './ExecutionPanel.module.css';

const ExecutionCard = ({ e }: { e: Execution }) => {
  const st2 = useApi(stackstormApiRef);

  return (
    <Card className={styles.card}>
      <CardBody>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th scope="row">Name</th>
              <td>{e.action.ref}</td>
            </tr>
            <tr>
              <th scope="row">Status</th>
              <td>
                <Status status={e.status} />
              </td>
            </tr>
            <tr>
              <th scope="row">Execution ID</th>
              <td>{e.id}</td>
            </tr>
            <tr>
              <th scope="row">Started</th>
              <td>{new Date(e.start_timestamp).toUTCString()}</td>
            </tr>
            <tr>
              <th scope="row">Finished</th>
              <td>{new Date(e.end_timestamp).toUTCString()}</td>
            </tr>
            <tr>
              <th scope="row">Execution Time</th>
              <td>{Math.round(e.elapsed_seconds)} s</td>
            </tr>
            <tr>
              <th scope="row">Runner</th>
              <td>{e.action.runner_type}</td>
            </tr>
          </tbody>
        </table>
        <Text className={styles.sectionTitle}>Action Output</Text>
        <CodeSnippet
          text={JSON.stringify(e.result, null, 2)}
          language="json"
          customStyle={{ width: 800 }}
        />
        <Text className={styles.sectionTitle}>Action Input</Text>
        <CodeSnippet
          text={JSON.stringify(e.parameters, null, 2)}
          language="json"
          customStyle={{ width: 800 }}
        />
      </CardBody>
      <CardFooter>
        <Button
          variant="secondary"
          onPress={() =>
            window.open(
              st2.getExecutionHistoryUrl(e.id),
              '_blank',
              'noopener,noreferrer',
            )
          }
        >
          View in ST2
        </Button>
      </CardFooter>
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
