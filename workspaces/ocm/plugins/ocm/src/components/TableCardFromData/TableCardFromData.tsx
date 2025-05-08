/*
 * Copyright 2024 The Backstage Authors
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
import { Link, Table } from '@backstage/core-components';

import { Card, CardContent, CardHeader } from '@material-ui/core';

const convertToGibibytes = (kibibytes: string): string => {
  const sizeInKibibytes = parseInt(
    kibibytes.substring(0, kibibytes.length - 2),
    10,
  );
  return `${(sizeInKibibytes / 2 ** 20).toFixed(0)} Gi`;
};

const valueFormatter = (value: any): any => {
  if (typeof value === 'string') {
    if (value.endsWith('Ki')) {
      return convertToGibibytes(value);
    } else if (value.startsWith('http')) {
      return <Link to={value}>{value}</Link>;
    }
  }
  return value;
};

export const TableCardFromData = ({
  data,
  title,
  nameMap,
}: {
  data: any;
  title: string;
  nameMap: Map<string, string>;
}) => {
  const parsedData: { name: string; value: any }[] = [];
  const entries = Object.entries(data);

  nameMap.forEach((_, key) => {
    const entry = entries.find(e => e[0] === key)!;
    // If key of the map doesn't have an prop in the cluster object, continue
    if (entry === undefined) {
      return;
    }
    parsedData.push({
      // entry[0] === name of the prop
      name: nameMap.get(entry[0])!,
      // entry[1] === value of the prop
      value: valueFormatter(entry[1]),
    });
  });

  if (parsedData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent style={{ padding: 0 }}>
        <Table
          options={{
            search: false,
            paging: false,
            toolbar: false,
            header: false,
            padding: 'dense',
          }}
          data={parsedData}
          columns={[
            {
              field: 'name',
              highlight: true,
              width: '15%',
              cellStyle: { whiteSpace: 'nowrap' },
            },
            { field: 'value' },
          ]}
        />
      </CardContent>
    </Card>
  );
};
