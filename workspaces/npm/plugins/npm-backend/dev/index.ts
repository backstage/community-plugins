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
import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { allExamples } from '../../npm/dev/examples';

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

backend.add(
  catalogServiceMock.factory({
    entities: allExamples,
  }),
);

backend.add(import('../src'));

backend.start();
