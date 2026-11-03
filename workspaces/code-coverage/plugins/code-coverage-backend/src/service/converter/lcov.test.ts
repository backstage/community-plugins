/*
 * Copyright 2021 The Backstage Authors
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
import fs from 'fs';
import path from 'path';
import { Lcov } from './lcov';
import { aggregateCoverage } from '../CoverageUtils';
import { mockServices } from '@backstage/backend-test-utils';

describe('convert lcov', () => {
  const converter = new Lcov(mockServices.rootLogger());
  [1, 2].forEach(idx => {
    const lcov = fs
      .readFileSync(
        path.resolve(`${__dirname}/../__fixtures__/lcov-testdata-${idx}.info`),
      )
      .toString();
    const expected = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            `${__dirname}/../__fixtures__/lcov-jsoncoverage-files-${idx}.json`,
          ),
        )
        .toString(),
    );
    const scmFiles = fs
      .readFileSync(
        path.resolve(
          `${__dirname}/../__fixtures__/lcov-sourcefiles-${idx}.txt`,
        ),
      )
      .toString()
      .split('\n');

    it(`should convert the lcov report with index ${idx} to json`, async () => {
      const files = converter.convert(lcov, scmFiles);

      expect(files).toEqual(expected);
    });
  });

  describe('function coverage', () => {
    const convert = (...records: string[]) =>
      converter.convert(
        ['TN:', 'SF:src/file.ts', ...records, 'end_of_record'].join('\n'),
        [],
      );

    it('counts functions that share a name separately', () => {
      const [file] = convert(
        'FN:1,useFactory',
        'FN:5,useFactory',
        'FN:9,10,handler',
        'FNDA:1,useFactory',
        'FNDA:0,useFactory',
        'FNDA:2,handler',
      );

      expect(file.functionHits).toEqual([1, 0, 2]);
    });

    it('combines FN and lcov 2.2 FNL records', () => {
      const files = convert(
        'FN:1,useFactory',
        'FN:5,useFactory',
        'FN:9,10,handler',
        'FNDA:1,useFactory',
        'FNDA:0,useFactory',
        'FNDA:2,handler',
        'FNL:0,12',
        'FNA:0,0,helper',
      );

      expect(files[0].functionHits).toEqual([1, 0, 2, 0]);
      expect(
        aggregateCoverage({
          metadata: {
            generationTime: 1,
            vcs: { type: 'foo', location: 'foo' },
          },
          entity: { kind: 'foo', name: 'foo', namespace: 'default' },
          files,
        }).function,
      ).toEqual({ available: 4, covered: 2, missed: 2, percentage: 50 });
    });

    it('handles lcov 2.2 aliases and malformed records', () => {
      const [file] = convert(
        'FNL:0,1,4',
        'FNA:0,0,foo',
        'FNA:0,2,foo_alias',
        'FNL:0,1,4',
        'FNL:1,6',
        'FNA:1,0,bar',
        'FNL:2,9',
        'FNA:3,1,orphan',
        'FNL:,9',
        'FNA:4',
        'FNA:5,x,broken',
      );

      expect(file.functionHits).toEqual([2, 0, 0, 1, 0]);
    });

    it('keeps commas in function names', () => {
      const [file] = convert(
        'FN:10,(anonymous_1)',
        'FN:12,fn(a,b)',
        'FNDA:2,(anonymous_1)',
        'FNDA:1,fn(a,b)',
      );

      expect(file.functionHits).toEqual([2, 1]);
    });

    it('resets function state for every file', () => {
      const files = converter.convert(
        [
          'SF:src/a.ts',
          'FN:1,run',
          'end_of_record',
          'SF:src/b.ts',
          'FN:1,run',
          'FNDA:3,run',
          'end_of_record',
        ].join('\n'),
        [],
      );

      expect(files.map(f => f.functionHits)).toEqual([[0], [3]]);
    });

    it('returns no function hits for a file without function records', () => {
      const [file] = convert('DA:1,1');

      expect(file.functionHits).toEqual([]);
    });
  });
});
