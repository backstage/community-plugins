/*
 * Copyright 2024 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';

import { useTags } from './quay';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getSecurityDetails: (param: any) => param,
    getTags: jest.fn().mockReturnValue({
      tags: [{ name: 'tag1', manifest_digest: 'manifestDigest' }],
    }),
  }),
}));

describe('useTags', () => {
  it('should return tags for provided org and repo', async () => {
    const { result } = renderHook(() => useTags('foo', 'bar'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(1);
    });
  });

  it('should return security status for tags', async () => {
    (useApi as jest.Mock).mockReturnValue({
      getSecurityDetails: jest
        .fn()
        .mockReturnValue({ data: null, status: 'unsupported' }),
      getTags: jest.fn().mockReturnValue({
        tags: [{ name: 'tag1', manifest_digest: 'manifestDigest' }],
      }),
    });
    const { result } = renderHook(() => useTags('foo', 'bar'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].securityStatus).toBe('unsupported');
      expect(result.current.data[0].securityDetails).toBeUndefined();
    });
  });

  it('should return tag layers as security details for tags', async () => {
    (useApi as jest.Mock).mockReturnValue({
      getSecurityDetails: jest
        .fn()
        .mockReturnValue({ data: { Layer: {} }, status: 'scanned' }),
      getTags: jest.fn().mockReturnValue({
        tags: [{ name: 'tag1', manifest_digest: 'manifestDigest' }],
      }),
    });
    const { result } = renderHook(() => useTags('foo', 'bar'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].securityStatus).toBe('scanned');
      expect(result.current.data[0].securityDetails).toEqual({});
    });
  });
});
