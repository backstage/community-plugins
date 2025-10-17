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

import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import * as data from '../../src/components/ConsumerGroupOffsets/__fixtures__/consumer-group-offsets.json';
import { ConsumerGroupOffsetsResponse } from '../../src/api/types';

const consumerGroupOffsets = data as ConsumerGroupOffsetsResponse;

export const catalogApi = catalogApiMock({
  entities: [
    {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: {
        name: 'test',
        annotations: {
          'kafka.apache.org/consumer-groups': `prod/${consumerGroupOffsets.consumerId}`,
        },
      },
      spec: {
        owner: 'guest',
        type: 'Website',
        lifecycle: 'development',
      },
    },
  ],
});
