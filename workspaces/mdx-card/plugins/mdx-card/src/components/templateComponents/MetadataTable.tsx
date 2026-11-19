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
import { Flex, Grid, Text } from '@backstage/ui';
import { formatValue } from './formatValue';

/**
 * Props for {@link MetadataTable}.
 *
 * @public
 */
export type MetadataTableProps = {
  metadata: Record<string, unknown>;
};

/**
 * Key and value list for showing metadata in templates.
 *
 * @public
 */
export const MetadataTable = ({ metadata }: MetadataTableProps) => (
  <Flex direction="column" gap="2">
    {Object.entries(metadata).map(([key, value]) => (
      <Grid.Root key={key} columns="3" gap="4">
        <Grid.Item>
          <Text weight="bold">{key}</Text>
        </Grid.Item>
        <Grid.Item colSpan="2">
          <Text>{formatValue(value)}</Text>
        </Grid.Item>
      </Grid.Root>
    ))}
  </Flex>
);
