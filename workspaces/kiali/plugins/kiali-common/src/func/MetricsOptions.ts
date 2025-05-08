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

import type { MetricsStatsQuery, Target } from '../types';

const genTargetKey = (target: Target): string => {
  return `${target.namespace}:${target.kind}:${target.name}`;
};

// !! genStatsKey HAS to mirror backend's models.MetricsStatsQuery#GenKey in models/metrics.go
export const genStatsKey = (
  target: Target,
  peer: Target | undefined,
  direction: string,
  interval: string,
): string => {
  const peerKey = peer ? genTargetKey(peer) : '';
  return `${genTargetKey(target)}:${peerKey}:${direction}:${interval}`;
};

export const statsQueryToKey = (q: MetricsStatsQuery) =>
  genStatsKey(q.target, q.peerTarget, q.direction, q.interval);
