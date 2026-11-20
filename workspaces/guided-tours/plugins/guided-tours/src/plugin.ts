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
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { guidedTourApi } from './extensions/api';
import { guidedTourOverlay } from './extensions/overlay';
import { guidedToursPage } from './extensions/page';
import { rootRouteRef } from './routes';

/**
 * The guided tour plugin: the tour registry (`api:guided-tours`), the overlay
 * that plays tours (`app-root-element:guided-tours/overlay`) and the overview
 * page (`page:guided-tours`).
 *
 * @public
 */
export const guidedTourPlugin = createFrontendPlugin({
  pluginId: 'guided-tours',
  extensions: [guidedTourApi, guidedTourOverlay, guidedToursPage],
  routes: {
    root: rootRouteRef,
  },
});
