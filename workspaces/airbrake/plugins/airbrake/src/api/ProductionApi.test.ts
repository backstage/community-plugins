/*
 * Copyright 2022 The Backstage Authors
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

import { ProductionAirbrakeApi } from './ProductionApi';
import { http, HttpResponse } from 'msw';
import mockGroupsData from './mock/airbrakeGroupsApiMock.json';
import { setupServer } from 'msw/node';
import { setupRequestMockHandlers } from '@backstage/test-utils';
import { localDiscoveryApi } from './mock';

describe('The production Airbrake API', () => {
  const productionApi = new ProductionAirbrakeApi(localDiscoveryApi);
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  it('fetches groups using the provided project ID', async () => {
    worker.use(
      http.get(
        'http://localhost:7007/api/airbrake/api/v4/projects/123456/groups',
        () => {
          return HttpResponse.json(mockGroupsData, { status: 200 });
        },
      ),
    );

    const groups = await productionApi.fetchGroups('123456');
    expect(groups).toStrictEqual(mockGroupsData);
  });

  it('throws if fetching groups was unsuccessful', async () => {
    worker.use(
      http.get(
        'http://localhost:7007/api/airbrake/api/v4/projects/123456/groups',
        () => {
          return new HttpResponse(null, { status: 500 });
        },
      ),
    );

    await expect(productionApi.fetchGroups('123456')).rejects.toThrow();
  });
});
