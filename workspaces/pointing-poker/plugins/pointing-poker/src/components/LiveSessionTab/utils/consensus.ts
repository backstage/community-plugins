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
import { calculateAverage } from '@backstage-community/plugin-pointing-poker-common';

export type ConsensusStatus = 'close' | 'discuss' | 'unanimous';

export type DistributionBucket = Readonly<{
  value: string;
  voters: VoteEntry[];
}>;

export type VoteAnalysis = Readonly<{
  average: null | string;
  distribution: DistributionBucket[];
  highOutlier?: VoteEntry;
  lowOutlier?: VoteEntry;
  median: null | string;
  mode: null | string;
  spread: null | Readonly<{ high: string; low: string }>;
  status: ConsensusStatus;
  total: number;
}>;

export type VoteEntry = Readonly<{
  avatarSeed?: string;
  avatarStyle?: string;
  userId: string;
  userName: string;
  value: string;
}>;

const isNumericVote = (value: string): boolean =>
  value !== '?' && !Number.isNaN(Number(value));

const formatNumber = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

// Non-numeric cards (e.g. "?") get their own bar but are excluded from the
// average/median/spread math.
export const analyzeVotes = (
  votes: VoteEntry[],
  deck: string[],
): VoteAnalysis => {
  const distribution: DistributionBucket[] = deck
    .map(value => ({
      value,
      voters: votes.filter(v => v.value === value),
    }))
    .filter(bucket => bucket.voters.length > 0);

  const numeric = votes
    .filter(v => isNumericVote(v.value))
    .map(v => ({ entry: v, num: Number(v.value) }))
    .sort((a, b) => a.num - b.num);

  const distinctValues = new Set(votes.map(v => v.value));

  let mode: null | string = null;
  let modeCount = 0;
  deck.forEach(value => {
    const count = votes.filter(v => v.value === value).length;
    if (count > modeCount) {
      modeCount = count;
      mode = value;
    }
  });

  const average = numeric.length
    ? calculateAverage(numeric.map(n => n.entry.value))
    : null;

  let median: null | string = null;
  if (numeric.length) {
    const mid = Math.floor(numeric.length / 2);
    median =
      numeric.length % 2 === 0
        ? formatNumber((numeric[mid - 1].num + numeric[mid].num) / 2)
        : formatNumber(numeric[mid].num);
  }

  const low = numeric[0];
  const high = numeric[numeric.length - 1];
  const spread = numeric.length
    ? { high: high.entry.value, low: low.entry.value }
    : null;

  const hasNonNumeric = votes.some(v => !isNumericVote(v.value));
  const cardSpread =
    numeric.length > 0
      ? deck.indexOf(high.entry.value) - deck.indexOf(low.entry.value)
      : 0;

  let status: ConsensusStatus;
  if (votes.length > 0 && distinctValues.size === 1) {
    status = 'unanimous';
  } else if (!hasNonNumeric && cardSpread <= 1) {
    status = 'close';
  } else {
    status = 'discuss';
  }

  const outliers =
    status === 'discuss' && numeric.length >= 2 && low.num !== high.num
      ? { highOutlier: high.entry, lowOutlier: low.entry }
      : {};

  return {
    average,
    distribution,
    median,
    mode,
    spread,
    status,
    total: votes.length,
    ...outliers,
  };
};
