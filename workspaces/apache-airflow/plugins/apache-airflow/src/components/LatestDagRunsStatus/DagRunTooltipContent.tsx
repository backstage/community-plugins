/*
 * Copyright 2026 The Backstage Authors
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

import { Link } from '@backstage/core-components';
import { Box, Button, Flex, Text } from '@backstage/ui';
import {
  RiCalendarLine,
  RiCheckLine,
  RiFlowChart,
  RiRunLine,
} from '@remixicon/react';
import { DagRun } from '../../api/types/Dags';
import styles from './LatestDagRunsStatus.module.css';

export const DagRunTooltipContent = ({
  dagRun,
  graphUrl,
}: {
  dagRun: DagRun;
  graphUrl: string;
}) => {
  return (
    <Flex className={styles.tooltipContent} direction="column">
      <Flex className={styles.tooltipItem} align="center">
        <Box className={styles.tooltipIcon} aria-label="DAG Run ID">
          <RiRunLine />
        </Box>
        <Text>{dagRun.dag_run_id}</Text>
      </Flex>
      <Flex className={styles.tooltipItem} align="center">
        <Box className={styles.tooltipIcon} aria-label="DAG Start Date">
          <RiCalendarLine />
        </Box>
        <Text>{new Date(dagRun.start_date).toLocaleString()}</Text>
      </Flex>
      <Flex className={styles.tooltipItem} align="center">
        <Box className={styles.tooltipIcon} aria-label="DAG End Date">
          <RiCheckLine />
        </Box>
        <Text>
          {dagRun.end_date ? new Date(dagRun.end_date).toLocaleString() : '-'}
        </Text>
      </Flex>
      <Box>
        <Link to={graphUrl} className={styles.graphLink}>
          <Button variant="secondary" iconStart={<RiFlowChart />}>
            Graph
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};
