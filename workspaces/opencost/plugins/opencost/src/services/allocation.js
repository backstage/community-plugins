/*
 * Copyright 2023 The Backstage Authors
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
class AllocationService {
  async fetchAllocation(fetchApi, baseUrl, win, aggregate, options) {
    const { accumulate } = options;
    const params = {
      window: win,
      aggregate: aggregate,
      step: '1d',
    };
    if (typeof accumulate === 'boolean') {
      params.accumulate = accumulate;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, value.toString());
    }

    const url = `${baseUrl}/allocation/compute?${searchParams.toString()}`;
    const response = await fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}

export default new AllocationService();
