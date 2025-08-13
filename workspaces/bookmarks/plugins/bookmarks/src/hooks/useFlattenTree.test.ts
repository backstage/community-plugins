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

import { renderHook } from '@testing-library/react';
import { useFlattenTree, useUnorderedFlattenedTree } from './useFlattenTree';
import { PATH_SEPARATOR } from '../consts/consts';

describe('useFlattenTree', () => {
  it('should export hook', () => {
    expect(useFlattenTree).toBeDefined();
  });

  it('should flatten a simple UrlTree', () => {
    const tree = {
      docs: 'https://docs.example.com',
      blog: 'https://blog.example.com',
    };
    const { result } = renderHook(() => useFlattenTree(tree));
    expect(result.current).toEqual([
      {
        key: ['docs'].join(PATH_SEPARATOR),
        value: 'https://docs.example.com',
      },
      {
        key: ['blog'].join(PATH_SEPARATOR),
        value: 'https://blog.example.com',
      },
    ]);
  });

  it('should flatten a nested UrlTree', () => {
    const tree = {
      docs: {
        gettingStarted: 'https://docs.example.com/getting-started',
        api: 'https://docs.example.com/api',
      },
      blog: 'https://blog.example.com',
    };
    const { result } = renderHook(() => useFlattenTree(tree));
    expect(result.current).toEqual([
      {
        key: ['docs', 'gettingStarted'].join(PATH_SEPARATOR),
        value: 'https://docs.example.com/getting-started',
      },
      {
        key: ['docs', 'api'].join(PATH_SEPARATOR),
        value: 'https://docs.example.com/api',
      },
      {
        key: ['blog'].join(PATH_SEPARATOR),
        value: 'https://blog.example.com',
      },
    ]);
  });

  it('should return empty array for empty tree', () => {
    const tree = {};
    const { result } = renderHook(() => useFlattenTree(tree));
    expect(result.current).toEqual([]);
  });

  it('should handle deeply nested UrlTree', () => {
    const tree = {
      a: {
        b: {
          c: 'url1',
        },
        d: 'url2',
      },
      e: 'url3',
    };
    const { result } = renderHook(() => useFlattenTree(tree));
    expect(result.current).toEqual([
      { key: ['a', 'b', 'c'].join(PATH_SEPARATOR), value: 'url1' },
      { key: ['a', 'd'].join(PATH_SEPARATOR), value: 'url2' },
      { key: ['e'].join(PATH_SEPARATOR), value: 'url3' },
    ]);
  });
});

describe('useUnorderedFlattenedTree', () => {
  it('should convert flattened tree to key-value map', () => {
    const tree = {
      docs: {
        gettingStarted: 'https://docs.example.com/getting-started',
        api: 'https://docs.example.com/api',
      },
      blog: 'https://blog.example.com',
    };
    const { result } = renderHook(() => useUnorderedFlattenedTree(tree));

    const gettingStartedKey = ['docs', 'gettingStarted'].join(PATH_SEPARATOR);
    const apiKey = ['docs', 'api'].join(PATH_SEPARATOR);
    const blogKey = ['blog'].join(PATH_SEPARATOR);

    expect(result.current).toEqual({
      [gettingStartedKey]: 'https://docs.example.com/getting-started',
      [apiKey]: 'https://docs.example.com/api',
      [blogKey]: 'https://blog.example.com',
    });
  });

  it('should return empty object for empty tree', () => {
    const tree = {};
    const { result } = renderHook(() => useUnorderedFlattenedTree(tree));
    expect(result.current).toEqual({});
  });
});
