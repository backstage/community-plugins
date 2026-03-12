/*
 * Copyright 2020 The Backstage Authors
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
  formatPeriod,
  formatPercent,
  lengthyCurrencyFormatter,
  quarterOf,
} from './formatters';
import { Duration } from '../types';
import { createCurrencyFormat } from './currency';

Date.now = jest.fn(() => new Date(Date.parse('2019-12-07')).valueOf());

describe('date formatters', () => {
  it('Formats quarters', () => {
    expect(quarterOf('2020-01-01')).toBe('Q1 2020');
    expect(quarterOf('2020-02-29')).toBe('Q1 2020');
    expect(quarterOf('2020-05-11')).toBe('Q2 2020');
    expect(quarterOf('2020-06-30')).toBe('Q2 2020');
    expect(quarterOf('2020-07-01')).toBe('Q3 2020');
    expect(quarterOf('2020-10-04')).toBe('Q4 2020');
  });

  it('Correctly formats values to two significant digits', () => {
    const values = [
      0.00000040925, 0.21, 0.0000004, 0.4139877878, 0.00000234566,
    ];
    const formattedValues = values.map(val =>
      lengthyCurrencyFormatter(createCurrencyFormat()).format(val),
    );
    expect(formattedValues).toEqual([
      '$0.00000041',
      '$0.21',
      '$0.00000040',
      '$0.41',
      '$0.0000023',
    ]);
  });

  it('Correctly formats values in euros to two significant digits', () => {
    const values = [
      0.00000040925, 0.21, 0.0000004, 0.4139877878, 0.00000234566,
    ];
    const formattedValues = values.map(val =>
      lengthyCurrencyFormatter(createCurrencyFormat('EUR')).format(val),
    );
    expect(formattedValues).toEqual([
      '€0.00000041',
      '€0.21',
      '€0.00000040',
      '€0.41',
      '€0.0000023',
    ]);
  });
});

describe.each`
  duration         | date            | isEndDate | output
  ${Duration.P3M}  | ${'2020-10-11'} | ${true}   | ${'Q3 2020'}
  ${Duration.P3M}  | ${'2020-10-11'} | ${false}  | ${'Q2 2020'}
  ${Duration.P30D} | ${'2020-10-11'} | ${true}   | ${'Last 30 Days'}
  ${Duration.P30D} | ${'2020-10-11'} | ${false}  | ${'First 30 Days'}
  ${Duration.P90D} | ${'2020-10-11'} | ${true}   | ${'Last 90 Days'}
  ${Duration.P90D} | ${'2020-10-11'} | ${false}  | ${'First 90 Days'}
`('formatPeriod', ({ duration, date, isEndDate, output }) => {
  it(`Correctly formats ${duration} with date ${date}`, async () => {
    expect(formatPeriod(duration, date, isEndDate)).toBe(output);
  });
});

describe('formatPeriod with custom date range', () => {
  it('Correctly formats custom duration without comparison mode (shows full range)', () => {
    const customDateRange = { start: '2020-10-01', end: '2020-10-15' };
    expect(
      formatPeriod(
        Duration.CUSTOM,
        '2020-10-01',
        false,
        customDateRange,
        false,
      ),
    ).toBe('Oct 01 - Oct 15, 2020');
    // Both isEndDate values return the same for non-comparison mode
    expect(
      formatPeriod(Duration.CUSTOM, '2020-10-15', true, customDateRange, false),
    ).toBe('Oct 01 - Oct 15, 2020');
  });

  it('Correctly formats custom duration with comparison mode and 15 days total (shows 7 and 8 days)', () => {
    const customDateRange = { start: '2020-10-01', end: '2020-10-15' };
    // 15 days total: floor(15/2) = 7 first, 15-7 = 8 last
    expect(
      formatPeriod(Duration.CUSTOM, '2020-10-01', false, customDateRange, true),
    ).toBe('First 7 Days');
    expect(
      formatPeriod(Duration.CUSTOM, '2020-10-15', true, customDateRange, true),
    ).toBe('Last 8 Days');
  });

  it('Correctly formats custom duration with comparison mode and 30 days total (shows 15 and 15 days)', () => {
    const customDateRange = { start: '2020-09-01', end: '2020-09-30' };
    // 30 days total: floor(30/2) = 15 first, 30-15 = 15 last
    expect(
      formatPeriod(Duration.CUSTOM, '2020-09-01', false, customDateRange, true),
    ).toBe('First 15 Days');
    expect(
      formatPeriod(Duration.CUSTOM, '2020-09-30', true, customDateRange, true),
    ).toBe('Last 15 Days');
  });

  it('Correctly formats custom duration with comparison mode and 31 days total (shows 15 and 16 days)', () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-31' };
    // 31 days total: floor(31/2) = 15 first, 31-15 = 16 last
    expect(
      formatPeriod(Duration.CUSTOM, '2020-01-01', false, customDateRange, true),
    ).toBe('First 15 Days');
    expect(
      formatPeriod(Duration.CUSTOM, '2020-01-31', true, customDateRange, true),
    ).toBe('Last 16 Days');
  });

  it('Correctly formats custom duration with comparison mode and 1 day total', () => {
    const customDateRange = { start: '2020-10-01', end: '2020-10-01' };
    // 1 day total: floor(1/2) = 0 first, 1-0 = 1 last
    expect(
      formatPeriod(Duration.CUSTOM, '2020-10-01', false, customDateRange, true),
    ).toBe('First 0 Days');
    expect(
      formatPeriod(Duration.CUSTOM, '2020-10-01', true, customDateRange, true),
    ).toBe('Last 1 Days');
  });

  it('Fallback to date format when no customDateRange provided', () => {
    expect(formatPeriod(Duration.CUSTOM, '2020-10-01', false)).toBe(
      'Oct 01, 2020',
    );
    expect(formatPeriod(Duration.CUSTOM, '2020-10-15', true)).toBe(
      'Oct 15, 2020',
    );
  });
});

describe.each`
  ratio             | expected
  ${0.0}            | ${'0%'}
  ${0.000000000001} | ${'0%'}
  ${-0.00000000001} | ${'0%'}
  ${0.123123}       | ${'12%'}
  ${1.123}          | ${'112%'}
  ${10.123}         | ${'>1000%'}
  ${-0.123123}      | ${'-12%'}
  ${-1.123}         | ${'-112%'}
  ${-10.123}        | ${'>-1000%'}
`('formatPercent', ({ ratio, expected }) => {
  it(`correctly formats ${ratio} as ${expected}`, () => {
    expect(formatPercent(ratio)).toBe(expected);
  });
});
