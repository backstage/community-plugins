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
import { stringCompareFilter, stringCompareSort, getIconType } from './helpers';
import { helm, kubernetes, oci, git } from '../images/icons';

describe('stringCompareSort', () => {
  it('should return a comparator function that sorts by the result of the given function', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: 'bar' },
      { name: 'baz' },
      { name: 'foo' },
    ]);
  });

  it('should handle null values', () => {
    const data = [{ name: 'foo' }, { name: null }, { name: 'baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: null },
      { name: 'baz' },
      { name: 'foo' },
    ]);
  });

  it('should be case insensitive', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'Baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: 'bar' },
      { name: 'Baz' },
      { name: 'foo' },
    ]);
  });
});

describe('stringCompareFilter', () => {
  it('should filter by the result of the given function', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const filter = stringCompareFilter((d: any) => d.name);

    expect(data.filter(item => filter('bar', item))).toEqual([{ name: 'bar' }]);
  });

  it('should be case insensitive', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const filter = stringCompareFilter((d: any) => d.name);

    expect(data.filter(item => filter('BAR', item))).toEqual([{ name: 'bar' }]);
  });
});

describe('getIconType', () => {
  it('should return the icon corresponding to the resource type', () => {
    const testCases = [
      { type: 'HelmRelease', icon: helm },
      { type: 'HelmRepository', icon: helm },
      { type: 'Kustomization', icon: kubernetes },
      { type: 'GitRepository', icon: git },
      { type: 'OCIRepository', icon: oci },
      { type: 'Unknown', icon: null },
    ];

    for (const testCase of testCases) {
      expect(getIconType(testCase.type)).toEqual(testCase.icon);
    }
  });
});
