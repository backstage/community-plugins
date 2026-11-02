/*
 * Copyright 2020 The Backstage Authors
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
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
} from '@backstage/core-components';
import { Flex, Text } from '@backstage/ui';

const statusContent = (status: string) => {
  switch (status.toLocaleLowerCase('en-US')) {
    case 'queued':
      return { icon: <StatusPending />, text: 'Queued' };
    case 'working':
      return { icon: <StatusRunning />, text: 'In progress' };
    case 'success':
      return { icon: <StatusOK />, text: 'Completed' };
    case 'cancelled':
      return { icon: <StatusAborted />, text: 'Cancelled' };
    case 'failure':
      return { icon: <StatusError />, text: 'Failed' };
    default:
      return { icon: <StatusPending />, text: 'Pending' };
  }
};

export const WorkflowRunStatus = ({ status }: { status?: string }) => {
  if (status === undefined) return null;
  const content = statusContent(status);
  return (
    <Flex align="center" gap="1">
      {content.icon}
      <Text variant="body-small">{content.text}</Text>
    </Flex>
  );
};
