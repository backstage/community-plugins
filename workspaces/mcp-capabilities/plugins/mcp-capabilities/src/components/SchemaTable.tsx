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
import { Table, CellText, Text } from '@backstage/ui';
import { JsonObject } from '@backstage/types';

interface SchemaRow {
  id: string;
  name: string;
  type: string;
  required: string;
  description: string;
}

/**
 * Renders the `properties` of a JSON schema (e.g. a tool's inputSchema) as a
 * simple BUI table.
 */
export function SchemaTable(props: { schema?: JsonObject }) {
  const schema = props.schema ?? {};
  const properties = (schema.properties as JsonObject | undefined) ?? {};
  const required = (schema.required as string[] | undefined) ?? [];

  const rows: SchemaRow[] = Object.entries(properties).map(([name, raw]) => {
    const def = (raw ?? {}) as JsonObject;
    const type = Array.isArray(def.type)
      ? (def.type as string[]).join(' | ')
      : (def.type as string) ?? '';
    return {
      id: name,
      name,
      type,
      required: required.includes(name) ? 'required' : '',
      description: (def.description as string) ?? '',
    };
  });

  if (rows.length === 0) {
    return (
      <Text variant="body-medium" color="secondary">
        No input parameters.
      </Text>
    );
  }

  return (
    <Table<SchemaRow>
      data={rows}
      pagination={{ type: 'none' }}
      columnConfig={[
        {
          id: 'name',
          label: 'Parameter',
          isRowHeader: true,
          cell: r => <CellText title={r.name} />,
        },
        { id: 'type', label: 'Type', cell: r => <CellText title={r.type} /> },
        {
          id: 'required',
          label: 'Required',
          cell: r => <CellText title={r.required} />,
        },
        {
          id: 'description',
          label: 'Description',
          cell: r => <CellText title={r.description} />,
        },
      ]}
    />
  );
}
