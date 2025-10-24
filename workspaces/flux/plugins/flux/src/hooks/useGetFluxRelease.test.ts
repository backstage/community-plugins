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
import { MockFetchApi } from '@backstage/test-utils';
import { FluxRelease } from '../objects';
import { getFluxLatestRelease } from './useGetFluxRelease';

describe('getFluxLatestRelease', () => {
  const release = {
    name: 'v0.0.0',
  } as FluxRelease;

  it('should get the latest release of Flux', async () => {
    const fetchApiMock = new MockFetchApi({
      baseImplementation: async () => {
        return {
          json: async () => release,
        } as Response;
      },
    });

    const latestFluxRelease = await getFluxLatestRelease(fetchApiMock);
    expect(latestFluxRelease).toEqual(release);
  });
});
