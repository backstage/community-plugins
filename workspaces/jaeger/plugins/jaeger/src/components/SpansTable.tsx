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

import { Table, TableColumn } from '@backstage/core-components';
import prettyMilliseconds from 'pretty-ms';
import { Span } from '@backstage-community/plugin-jaeger-common';

type SpansTableProps = {
  spans: Span[];
  processes: Record<string, any>;
};
export const SpansTable = ({ spans, processes }: SpansTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Service Name', field: 'serviceName' },
    { title: 'Operation Name', field: 'operationName' },
    { title: 'Span Id', field: 'spanId' },
    { title: 'Start Time', field: 'startTime' },
    { title: 'Duration', field: 'duration' },
  ];

  const sorted_spans = spans.sort((a, b) => a.startTime - b.startTime);

  const data = sorted_spans.map(span => {
    return {
      serviceName: processes[span.processID]?.serviceName,
      operationName: span.operationName,
      spanId: span.spanID,
      startTime: new Date(span.startTime / 1000).toLocaleString(),
      duration: prettyMilliseconds(span.duration / 1000, {
        millisecondsDecimalDigits: 3,
        secondsDecimalDigits: 2,
      }),
    };
  });

  return (
    <Table
      title="Span Details"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
