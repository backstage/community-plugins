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
import { createApiFactory } from '@backstage/core-plugin-api';

import type { DefaultManageApiOptions } from './DefaultManageTechInsightsApi';
import { DefaultManageTechInsightsApi } from './DefaultManageTechInsightsApi';
import { manageTechInsightsApiRef } from './api';

/**
 * Factory for creating the manage tech insights API.
 *
 * @public
 */
export function createManageTechInsightsApiFactory(
  options?: DefaultManageApiOptions,
) {
  return createApiFactory({
    api: manageTechInsightsApiRef,
    deps: {},
    factory() {
      return new DefaultManageTechInsightsApi(options);
    },
  });
}
