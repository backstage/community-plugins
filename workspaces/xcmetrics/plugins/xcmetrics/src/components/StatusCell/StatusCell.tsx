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

import { Tooltip } from '@backstage/ui';
import { TooltipTrigger } from 'react-aria-components';
import { BuildStatus, BuildStatusResult, xcmetricsApiRef } from '../../api';
import { cn, formatDuration, formatStatus } from '../../utils';
import useAsync from 'react-use/esm/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import styles from './StatusCell.module.css';

interface TooltipContentProps {
  buildId: string;
}

const TooltipContent = ({ buildId }: TooltipContentProps) => {
  const client = useApi(xcmetricsApiRef);
  const { value, loading, error } = useAsync(
    async () => client.getBuild(buildId),
    [],
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  if (loading || !value?.build) {
    return <Progress style={{ width: 100 }} />;
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>Started</td>
          <td>{new Date(value.build.startTimestamp).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>{formatDuration(value.build.duration)}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>{formatStatus(value.build.buildStatus)}</td>
        </tr>
      </tbody>
    </table>
  );
};

interface StatusCellProps {
  buildStatus?: BuildStatusResult;
  size: number;
  spacing: number;
}

export const StatusCell = (props: StatusCellProps) => {
  const { buildStatus, size, spacing } = props;
  const cellStyle = {
    width: size,
    height: size,
    marginRight: spacing,
    marginBottom: spacing,
  };

  if (!buildStatus) {
    return <div className={styles.root} style={cellStyle} />;
  }

  return (
    <TooltipTrigger delay={500}>
      <button
        data-testid={buildStatus.id}
        className={cn(
          styles.root,
          styles[buildStatus.buildStatus as BuildStatus],
        )}
        style={cellStyle}
        aria-label={formatStatus(buildStatus.buildStatus)}
      />
      <Tooltip>
        <TooltipContent buildId={buildStatus.id} />
      </Tooltip>
    </TooltipTrigger>
  );
};
