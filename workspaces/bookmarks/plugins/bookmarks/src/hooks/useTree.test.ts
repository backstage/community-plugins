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
import { useTree, USE_TREE_ERROR } from './useTree';
import { useEntity } from '@backstage/plugin-catalog-react';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

const mockUseEntity = useEntity as jest.Mock;

describe('useTree', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns tree when bookmarks are valid', () => {
    const validTree = { foo: { bar: 'https://example.com' } };
    mockUseEntity.mockReturnValue({
      entity: { metadata: { bookmarks: validTree } },
    });
    const { result } = renderHook(() => useTree());
    expect(result.current).toEqual({ tree: validTree, error: null });
  });

  it('returns INVALID error when bookmarks are not a valid UrlTree', () => {
    mockUseEntity.mockReturnValue({
      entity: { metadata: { bookmarks: { longhorn: 4074 } } },
    });
    const { result } = renderHook(() => useTree());
    expect(result.current).toEqual({
      tree: null,
      error: USE_TREE_ERROR.INVALID,
    });
  });

  it('returns NOT_FOUND error when bookmarks are missing', () => {
    mockUseEntity.mockReturnValue({ entity: { metadata: {} } });
    const { result } = renderHook(() => useTree());
    expect(result.current).toEqual({
      tree: null,
      error: USE_TREE_ERROR.NOT_FOUND,
    });
  });

  it('returns NOT_FOUND error when bookmarks object is empty', () => {
    mockUseEntity.mockReturnValue({ entity: { metadata: { bookmarks: {} } } });
    const { result } = renderHook(() => useTree());
    expect(result.current).toEqual({
      tree: null,
      error: USE_TREE_ERROR.NOT_FOUND,
    });
  });
});
