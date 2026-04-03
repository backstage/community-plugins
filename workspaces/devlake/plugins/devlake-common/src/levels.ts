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

import { DoraLevel } from './types';

/**
 * Color scheme for DORA performance levels.
 *
 * @public
 */
export const DORA_LEVEL_COLORS: Record<DoraLevel, string> = {
  elite: '#4CAF50',
  high: '#2196F3',
  medium: '#FF9800',
  low: '#F44336',
};

/**
 * Display labels for DORA performance levels.
 *
 * @public
 */
export const DORA_LEVEL_LABELS: Record<DoraLevel, string> = {
  elite: 'Elite',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/**
 * Classify deployment frequency into a DORA level.
 * Based on the 2023 State of DevOps Report.
 *
 * @param deploysPerDay - Average number of deployments per day
 * @public
 */
export function classifyDeploymentFrequency(deploysPerDay: number): DoraLevel {
  if (deploysPerDay >= 1) return 'elite';
  if (deploysPerDay >= 1 / 7) return 'high'; // at least weekly
  if (deploysPerDay >= 1 / 180) return 'medium'; // at least every 6 months
  return 'low';
}

/**
 * Classify lead time for changes into a DORA level.
 *
 * @param hours - Lead time in hours
 * @public
 */
export function classifyLeadTime(hours: number): DoraLevel {
  if (hours < 1) return 'elite';
  if (hours < 168) return 'high'; // < 1 week
  if (hours < 720) return 'medium'; // < 1 month
  return 'low';
}

/**
 * Classify change failure rate into a DORA level.
 *
 * @param rate - Change failure rate as a percentage (0-100)
 * @public
 */
export function classifyChangeFailureRate(rate: number): DoraLevel {
  if (rate < 5) return 'elite';
  if (rate < 10) return 'high';
  if (rate < 15) return 'medium';
  return 'low';
}

/**
 * Classify mean time to recovery into a DORA level.
 *
 * @param hours - MTTR in hours
 * @public
 */
export function classifyMeanTimeToRecovery(hours: number): DoraLevel {
  if (hours < 1) return 'elite';
  if (hours < 24) return 'high';
  if (hours < 168) return 'medium'; // < 1 week
  return 'low';
}
