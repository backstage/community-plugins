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

import {
  ApiBlueprint,
  discoveryApiRef,
  errorApiRef,
  fetchApiRef,
  identityApiRef,
  storageApiRef,
} from '@backstage/frontend-plugin-api';
import { UserSettingsStorage } from '@backstage/plugin-user-settings';

export default ApiBlueprint.make({
  params(defineParams) {
    return defineParams({
      api: storageApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        errorApi: errorApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, errorApi, fetchApi, identityApi }) => {
        return UserSettingsStorage.create({
          discoveryApi,
          errorApi,
          fetchApi,
          identityApi,
        });
      },
    });
  },
});
