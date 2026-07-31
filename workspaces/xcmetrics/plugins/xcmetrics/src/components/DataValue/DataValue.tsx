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
import { Grid, Text } from '@backstage/ui';
import type { Columns } from '@backstage/ui';

interface DataValueProps {
  field: string;
  value?: string | number | null | undefined;
}

export const DataValue = ({ field, value }: DataValueProps) => {
  return (
    <div>
      <Text variant="body-x-small">{field}</Text>
      <Text variant="body-medium">{value ?? '--'}</Text>
    </div>
  );
};

interface GridItemProps {
  xs?: number;
  md?: number;
  lg?: number;
}

export const DataValueGridItem = (props: DataValueProps & GridItemProps) => (
  <Grid.Item
    colSpan={{
      sm: String(props.xs ?? 6) as Columns,
      md: String(props.md ?? 6) as Columns,
    }}
  >
    <DataValue {...props} />
  </Grid.Item>
);
