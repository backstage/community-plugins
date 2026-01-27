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
interface NumericSuffixConfig {
  value: number;
  symbol: string;
}

const suffixMappings: NumericSuffixConfig[] = [
  { value: 1, symbol: '' },
  { value: 1e3, symbol: 'K' },
  { value: 1e6, symbol: 'M' },
  { value: 1e9, symbol: 'G' },
  { value: 1e12, symbol: 'T' },
  { value: 1e15, symbol: 'P' },
  { value: 1e18, symbol: 'E' },
];

const defaultLocale = 'en-US';

export function formatNumberWithSuffix(
  num: number,
  decimalPlaces: number = 1,
): string {
  const { value, symbol } = suffixMappings.reduce((result, item) =>
    num >= item.value ? item : result,
  );
  return (
    (num / value).toLocaleString(defaultLocale, {
      maximumFractionDigits: decimalPlaces,
    }) + symbol
  );
}
