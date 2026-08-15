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
/** @public */
export const DEFAULT_FIBONACCI_VALUES = [
  '0',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '20',
  '40',
  '100',
  '?',
];

/** @public */
export const DEFAULT_T_SHIRT_VALUES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'];

/** @public */
export function calculateAverage(votes: string[]): string {
  const numeric = votes
    .filter(v => v !== '?')
    .map(v => parseFloat(v))
    .filter(n => !isNaN(n));
  if (numeric.length === 0) return '0';
  const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
  return avg.toFixed(1);
}

/** @public */
export function findClosestFibonacci(value: number): string {
  const fibs = DEFAULT_FIBONACCI_VALUES.filter(v => v !== '?').map(v =>
    parseFloat(v),
  );
  return fibs
    .reduce((closest, fib) =>
      Math.abs(fib - value) < Math.abs(closest - value) ? fib : closest,
    )
    .toString();
}
