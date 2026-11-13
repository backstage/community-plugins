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
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useLoadedElement } from './useLoadedElement';

describe('useLoadedElement', () => {
  it('is idle without a loader', () => {
    const { result } = renderHook(() => useLoadedElement(undefined));
    expect(result.current.status).toBe('none');
  });

  it('loads once and caches per loader', async () => {
    const loader = jest.fn(async () => <span>hi</span>);
    type Props = { l: typeof loader | undefined };
    const { result, rerender } = renderHook(
      ({ l }: Props) => useLoadedElement(l),
      { initialProps: { l: loader } as Props },
    );
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.element).toEqual(<span>hi</span>);

    await act(async () => rerender({ l: undefined }));
    await act(async () => rerender({ l: loader }));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('reports a failed loader', async () => {
    const loader = async () => {
      throw new Error('nope');
    };
    const { result } = renderHook(() => useLoadedElement(loader));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.message).toBe('nope');
  });
});
