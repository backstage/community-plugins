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
import React from 'react';
import {
  DependencyGraph,
  DependencyGraphTypes,
} from '@backstage/core-components';
import { Span } from '@backstage-community/plugin-jaeger-common';

type SpansTableProps = {
  spans: Span[];
  processes: Record<string, any>;
};

export const TrageGraph = ({ spans, processes }: SpansTableProps) => {
  const addedServiceNames = new Set();
  const exampleNodes = Object.keys(processes)
    .map(processID => {
      const serviceName = processes[processID]?.serviceName || processID;
      if (addedServiceNames.has(serviceName)) {
        return null;
      }
      addedServiceNames.add(serviceName);
      return {
        id: serviceName,
      };
    })
    .filter(node => node !== null);

  const exampleEdges = spans.flatMap(span => {
    span.references
      .filter(ref => ref.refType === 'CHILD_OF')
      .map(ref => {
        const parentSpan = spans.find(s => s.spanID === ref.spanID);
        const from = parentSpan
          ? processes[parentSpan.processID]?.serviceName || parentSpan.processID
          : null;
        const to = processes[span.processID]?.serviceName || span.processID;
        if (from !== to) {
          return { from, to };
        }
        return undefined;
        // const parentServiceName =  parentSpan ? processes[parentSpan.processID]?.serviceName || parentSpan.processID : null
        // const childServiceName = processes[span.processID]?.serviceName || span.processID
        // if (parentServiceName !== childServiceName) {
        //     return {
        //         from: parentServiceName,
        //         to: childServiceName
        //     }
        // }
        // return undefined
      })
      .filter(edge => edge !== undefined);

    const serviceName =
      processes[span.processID]?.serviceName || span.processID;
    return {
      source: serviceName,
      target: span.operationName,
    };
  });

  return (
    <DependencyGraph
      nodes={exampleNodes}
      edges={exampleEdges}
      direction={DependencyGraphTypes.Direction.LEFT_RIGHT}
    />
  );
};
