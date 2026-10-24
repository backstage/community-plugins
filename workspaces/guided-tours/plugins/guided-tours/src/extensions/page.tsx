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
import { PageBlueprint } from '@backstage/frontend-plugin-api';
import { RiCompass3Line } from '@remixicon/react';
import { rootRouteRef } from '../routes';

export const guidedToursPage = PageBlueprint.make({
  params: {
    path: '/guided-tours',
    title: 'Guided tours',
    icon: <RiCompass3Line />,
    routeRef: rootRouteRef,
    loader: () =>
      import('../components/page/GuidedToursPage').then(m => (
        <m.GuidedToursPage />
      )),
  },
});
