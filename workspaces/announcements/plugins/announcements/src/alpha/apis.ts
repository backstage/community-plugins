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
import {
  ApiBlueprint,
  discoveryApiRef,
  errorApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import {
  announcementsApiRef,
  AnnouncementsClient,
} from '@backstage-community/plugin-announcements-react';

/**
 * @alpha
 */
export const announcementsApiExtension = ApiBlueprint.make({
  params: define =>
    define({
      api: announcementsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef,
        errorApi: errorApiRef,
      },
      factory: ({ discoveryApi, identityApi, fetchApi, errorApi }) =>
        new AnnouncementsClient({
          discoveryApi,
          identityApi,
          fetchApi,
          errorApi,
        }),
    }),
});
