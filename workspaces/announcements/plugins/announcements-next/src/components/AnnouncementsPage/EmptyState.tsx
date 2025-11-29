/*
 * Copyright 2025 The Backstage Authors
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
import { Flex, Text } from '@backstage/ui';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="3"
      p="6"
      style={{ textAlign: 'center' }}
    >
      <Text as="h3" variant="title-small" color="secondary">
        No Announcements
      </Text>
      <Text color="secondary">{message}</Text>
    </Flex>
  );
}

export default EmptyState;
