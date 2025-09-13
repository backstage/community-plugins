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
import { datetimeSort, numericSort } from './Columns.tsx';

describe('datetimeSort', () => {
  [
    { a: new Date(2025, 1).toISOString(), b: new Date(2026, 2).toISOString() },
    { a: new Date(2019, 3).toISOString(), b: new Date(2024, 5).toISOString() },
    {
      a: new Date(2019, 2, 1).toISOString(),
      b: new Date(2019, 2, 2).toISOString(),
    },
  ].forEach(({ a, b }) => {
    it(`should return negative number when ${a} < ${b}`, () => {
      const result = datetimeSort<string>(x => x)(a, b, undefined);
      expect(result).toBeLessThan(0);
    });
  });

  [
    { a: new Date(2026, 1).toISOString(), b: new Date(2026, 1).toISOString() },
    {
      a: new Date(2011, 9, 13).toISOString(),
      b: new Date(2011, 9, 13).toISOString(),
    },
  ].forEach(({ a, b }) => {
    it(`should return 0 when ${a} === ${b}`, () => {
      const result = datetimeSort<string>(x => x)(a, b, undefined);
      expect(result).toBe(0);
    });
  });

  [
    { a: new Date(2026, 7).toISOString(), b: new Date(2025, 1).toISOString() },
    { a: new Date(2024, 2).toISOString(), b: new Date(2019, 10).toISOString() },
    {
      a: new Date(2019, 2, 2).toISOString(),
      b: new Date(2019, 2, 1).toISOString(),
    },
  ].forEach(({ a, b }) => {
    it(`should return positive number when ${a} > ${b}`, () => {
      const result = datetimeSort<string>(x => x)(a, b, undefined);
      expect(result).toBeGreaterThan(0);
    });
  });

  [undefined, null, '', '.', 'text', '$/}', '1970--01--01'].forEach(invalid => {
    const validDateString = '2025-09-08T10:04:46+0200';
    it(`should return negative number when second param is not-a-number '${invalid}'`, () => {
      const result = datetimeSort<any>(x => x)(
        validDateString,
        invalid,
        undefined,
      );
      expect(result).toBeLessThan(0);
    });

    it(`should return 0 when both params are not-a-number '${invalid}'`, () => {
      const result = datetimeSort<any>(x => x)(invalid, invalid, undefined);
      expect(result).toBe(0);
    });

    it(`should return positive number when first param is not-a-number '${invalid}'`, () => {
      const result = datetimeSort<any>(x => x)(
        invalid,
        validDateString,
        undefined,
      );
      expect(result).toBeGreaterThan(0);
    });
  });

  it(`should return 0 when both params are different not-a-number`, () => {
    const result = datetimeSort<any>(x => x)('a', 'b', undefined);
    expect(result).toBe(0);
  });

  it('should execute a deeply nested accessor', () => {
    const obj = { one: { two: { three: '4' } } };
    const accessor = (x: any) => x.one.two.three;
    const result = datetimeSort<any>(accessor)(obj, obj, undefined);
    expect(result).toBe(0);
  });
});

describe('numericSort', () => {
  [
    { a: '0.9', b: '1' },
    { a: '1', b: '2' },
    { a: '2', b: '5' },
  ].forEach(({ a, b }) => {
    it(`should return negative number when ${a} < ${b}`, () => {
      const result = numericSort<string | undefined>(x => x)(a, b, undefined);
      expect(result).toBeLessThan(0);
    });
  });

  [
    { a: '', b: '' },
    { a: '0', b: '0' },
    { a: '75.1', b: '75.1' },
  ].forEach(({ a, b }) => {
    it(`should return 0 when '${a}' === '${b}'`, () => {
      const result = numericSort<string | undefined>(x => x)(a, b, undefined);
      expect(result).toBe(0);
    });
  });

  [
    { a: '2.2', b: '2' },
    { a: '2', b: '1' },
    { a: '9', b: '5' },
  ].forEach(({ a, b }) => {
    it(`should return positive number when ${a} > ${b}`, () => {
      const result = numericSort<string | undefined>(x => x)(a, b, undefined);
      expect(result).toBeGreaterThan(0);
    });
  });

  [undefined, 'text', '.', '$/}'].forEach(notNumber => {
    it(`should return negative number when second param is not-a-number '${notNumber}'`, () => {
      const result = numericSort<any>(x => x)('1', notNumber, undefined);
      expect(result).toBeLessThan(0);
    });

    it(`should return 0 when both params are not-a-number '${notNumber}'`, () => {
      const result = numericSort<any>(x => x)(notNumber, notNumber, undefined);
      expect(result).toBe(0);
    });

    it(`should return positive number when first param is not-a-number '${notNumber}'`, () => {
      const result = numericSort<any>(x => x)(notNumber, '1', undefined);
      expect(result).toBeGreaterThan(0);
    });
  });

  it(`should return 0 when both params are different not-a-number`, () => {
    const result = numericSort<any>(x => x)('a', 'b', undefined);
    expect(result).toBe(0);
  });

  it('should execute a deeply nested accessor', () => {
    const obj = { one: { two: { three: '1970-01-01' } } };
    const accessor = (x: any) => x.one.two.three;
    const result = numericSort<any>(accessor)(obj, obj, undefined);
    expect(result).toBe(0);
  });
});
