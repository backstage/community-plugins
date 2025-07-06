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

import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import prettyMilliseconds from 'pretty-ms';
import { jaegerApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { TraceDrawer } from './TraceDrawer';
import { getJaegerAnnotation } from '../utils';
import { Trace } from '@backstage-community/plugin-jaeger-common';
import { getFirstAndLastSpanTime } from '../utils';

type DenseTableProps = {
  traces: Trace[];
};

export const DenseTable = ({ traces }: DenseTableProps) => {
  const columns: TableColumn[] = [
    {
      title: 'Trace',
      render: (data: any) => {
        const trace = data.trace as Trace;
        return <TraceDrawer open={false} trace={trace} />;
      },
    },
    { title: 'Spans', field: 'spans' },
    { title: 'Duration', field: 'duration' },
  ];

  const data = traces.map(trace => {
    const number_of_spans = trace.spans.length;
    const { maxStartTime, maxDuration, minStartTime } =
      getFirstAndLastSpanTime(trace);
    const spanDuration = maxStartTime + maxDuration - minStartTime;
    return {
      trace: trace,
      spans: number_of_spans,
      duration: prettyMilliseconds(spanDuration / 1000, {
        millisecondsDecimalDigits: 2,
        secondsDecimalDigits: 2,
      }),
    };
  });

  return (
    <Table
      title="Trace List"
      options={{ search: false, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const JaegerFetchComponent = () => {
  const { entity } = useEntity();
  const jaegerApi = useApi(jaegerApiRef);
  const { serviceName, operation, lookback, limit } =
    getJaegerAnnotation(entity);
  const { value, loading, error } = useAsync(async () => {
    const projects = await jaegerApi.getTraces(
      serviceName,
      operation,
      limit,
      lookback,
    );
    return await projects.data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable traces={value || []} />;
};
