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

/** A single line in a unified diff. */
export type DiffLine =
  | { type: 'context'; text: string }
  | { type: 'added'; text: string }
  | { type: 'removed'; text: string };

/** Compute a line-level unified diff between `before` and `after` via LCS. */
export function computeLineDiff(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      result.push({ type: 'context', text: a[i++] });
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: 'added', text: b[j++] });
    } else {
      result.push({ type: 'removed', text: a[i++] });
    }
  }
  return result;
}

/** Group diff lines into hunks of changed lines ± `context` surrounding lines. */
export function getHunks(lines: DiffLine[], context = 3): DiffLine[][] {
  const visible = new Set<number>();
  lines.forEach((l, idx) => {
    if (l.type !== 'context') {
      for (
        let k = Math.max(0, idx - context);
        k <= Math.min(lines.length - 1, idx + context);
        k++
      ) {
        visible.add(k);
      }
    }
  });
  if (visible.size === 0) return [];

  const sorted = Array.from(visible).sort((a, b) => a - b);
  const hunks: DiffLine[][] = [];
  let hunk: DiffLine[] = [];
  let prev = -2;
  for (const idx of sorted) {
    if (idx !== prev + 1 && hunk.length > 0) {
      hunks.push(hunk);
      hunk = [];
    }
    hunk.push(lines[idx]);
    prev = idx;
  }
  if (hunk.length > 0) hunks.push(hunk);
  return hunks;
}
