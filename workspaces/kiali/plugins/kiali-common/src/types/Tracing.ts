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
export type TracingQuery = {
  startMicros: number;
  endMicros?: number;
  tags?: string;
  limit?: number;
  minDuration?: number;
};

// Renamed from Span due conflict in TracingInfo
export type SpanTracing = {
  traceID: string;
  spanID: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags: Tag[];
  warnings?: string[];
  traceSize: number;
};

export type Tag = {
  key: string;
  type: string;
  value: any;
};

export const TEMPO = 'tempo';
