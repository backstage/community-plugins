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
import { renderHook, waitFor } from '@testing-library/react';

import { useTagDetails } from './quay';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getSecurityDetails: (param: any) => param }),
}));

describe('useTagDetails', () => {
  it('should return tag details for provided org, repo and digest', async () => {
    const { result } = renderHook(() =>
      useTagDetails('foo', 'bar', 'mock-digest'),
    );
    await waitFor(() => {
      expect(result.current).toEqual({ loading: false, value: 'foo' });
    });
  });
});
