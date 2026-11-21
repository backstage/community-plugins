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
import { Button, ButtonIcon, Flex, Text, TextField } from '@backstage/ui';
import { RiDeleteBinLine } from '@remixicon/react';
import type { DataFetcher } from '@backstage-community/plugin-mdx-card-common';

export const DataFetchersEditor = ({
  value,
  onChange,
}: {
  value: DataFetcher[];
  onChange: (value: DataFetcher[]) => void;
}) => {
  const update = (index: number, field: keyof DataFetcher, text: string) =>
    onChange(
      value.map((fetcher, i) =>
        i === index ? { ...fetcher, [field]: text } : fetcher,
      ),
    );

  return (
    <Flex direction="column" gap="2">
      <Flex justify="between" align="center">
        <Text variant="title-x-small">Data fetchers</Text>
        <Button
          size="small"
          variant="secondary"
          onPress={() =>
            onChange([
              ...value,
              { name: `data${value.length + 1}`, pluginId: '', apiUrl: '' },
            ])
          }
        >
          Add data fetcher
        </Button>
      </Flex>
      {value.length === 0 && (
        <Text variant="body-small" color="secondary">
          No data fetchers. Responses are available in the template as
          props.&lt;name&gt;.
        </Text>
      )}
      {value.map((fetcher, index) => (
        <Flex key={index} gap="2" align="end">
          <TextField
            label="Name"
            size="small"
            value={fetcher.name}
            onChange={text => update(index, 'name', text)}
            style={{ width: 140 }}
          />
          <TextField
            label="Plugin ID"
            size="small"
            value={fetcher.pluginId}
            onChange={text => update(index, 'pluginId', text)}
            style={{ width: 140 }}
          />
          <TextField
            label="API URL"
            size="small"
            value={fetcher.apiUrl}
            onChange={text => update(index, 'apiUrl', text)}
            style={{ flex: 1 }}
          />
          <ButtonIcon
            aria-label={`Remove data fetcher ${fetcher.name}`}
            variant="tertiary"
            icon={<RiDeleteBinLine />}
            onPress={() => onChange(value.filter((_, i) => i !== index))}
          />
        </Flex>
      ))}
    </Flex>
  );
};
