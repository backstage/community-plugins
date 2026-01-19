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
import {
  ApiBlueprint,
  configApiRef,
  discoveryApiRef,
} from '@backstage/frontend-plugin-api';
import { SplunkOnCallClient, splunkOnCallApiRef } from '../api';

/**
 * @alpha
 */
export const splunkOnCallApi = ApiBlueprint.make({
  name: 'splunk-on-call',
  params: defineParams =>
    defineParams({
      api: splunkOnCallApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ configApi, discoveryApi }) =>
        SplunkOnCallClient.fromConfig(configApi, discoveryApi),
    }),
});
