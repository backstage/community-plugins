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

import { Entity } from '@backstage/catalog-model';
import { Span } from '@backstage-community/plugin-jaeger-common';
import {
  JAEGER_SERVICE_ANNOTATION,
  JAEGER_OPERATION_ANNOTATION,
  JAEGER_LOOKBACK_ANNOTATION,
  JAEGER_LIMIT_ANNOTATION,
} from '@backstage-community/plugin-jaeger-common';

/**
 * Gets the current time in microseconds.
 *
 * @returns The current time in microseconds.
 */
export const getCurrentTimeInMicroseconds = (): number => {
  return Date.now() * 1_000;
};

/**
 * Converts a time string like '30m' or '1h' to seconds.
 *
 * @param timeStr - The time string to convert.
 * @returns The equivalent number of seconds.
 */
export const convertTimeStringToMicroSeconds = (timeStr: string): number => {
  const timePattern = /^(\d+)([mh])$/;
  const match = timeStr.match(timePattern);

  if (!match) {
    throw new Error('Invalid time format. Use "30m" or "1h".');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value * 60 * 1_000_000;
    case 'h':
      return value * 3600 * 1_000_000;
    default:
      throw new Error(
        'Invalid time unit. Use "m" for minutes or "h" for hours.',
      );
  }
};

/**
 * @public
 */
export const isJaegerAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[JAEGER_SERVICE_ANNOTATION]);

export const getJaegerAnnotation = (
  entity: Entity,
): {
  serviceName: string;
  operation?: string;
  lookback?: string;
  limit?: number;
} => {
  const serviceName: string | undefined =
    entity?.metadata.annotations?.[JAEGER_SERVICE_ANNOTATION];
  const operation: string | undefined =
    entity?.metadata.annotations?.[JAEGER_OPERATION_ANNOTATION];
  const lookback: string | undefined =
    entity?.metadata.annotations?.[JAEGER_LOOKBACK_ANNOTATION];
  const limit: number | undefined = entity?.metadata.annotations?.[
    JAEGER_LIMIT_ANNOTATION
  ]
    ? parseInt(entity.metadata.annotations[JAEGER_LIMIT_ANNOTATION], 10)
    : undefined;

  if (!serviceName) {
    throw new Error('Annotation is missing.');
  }

  return { serviceName, operation, lookback, limit };
};

export function getFirstAndLastSpanTime(trace: any) {
  let maxStartTime = 0;
  let minStartTime = Infinity;
  let maxDuration = 0;
  // let minDuration = 0;
  trace.spans.forEach((span: Span) => {
    if (span.startTime > maxStartTime) {
      maxStartTime = span.startTime;
      maxDuration = span.duration;
    }
    if (span.startTime < minStartTime) {
      minStartTime = span.startTime;
      // minDuration = span.duration;
    }
  });

  return {
    maxStartTime,
    maxDuration,
    minStartTime,
    // minDuration
  };
}
