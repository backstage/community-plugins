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
  createExtensionBlueprint,
  createExtensionDataRef,
} from '@backstage/frontend-plugin-api';
import { GuidedTour, GuidedTourParams } from './types';

/**
 * Extension data carrying a guided tour definition.
 *
 * @public
 */
export const guidedTourDataRef = createExtensionDataRef<GuidedTour>().with({
  id: 'guided-tour.tour',
});

/**
 * Creates a `guided-tour` extension that registers a tour with the guided
 * tour plugin. When that plugin is not installed the extension stays
 * unattached and nothing happens.
 *
 * @example
 * ```ts
 * const introTour = GuidedTourBlueprint.make({
 *   name: 'intro',
 *   params: {
 *     title: 'Welcome to Example',
 *     autoStart: { route: '/example' },
 *     steps: [{ id: 'todos', target: 'example.todos', content: 'Your **todos**.' }],
 *   },
 * });
 * ```
 *
 * @public
 */
export const GuidedTourBlueprint = createExtensionBlueprint({
  kind: 'guided-tour',
  attachTo: { id: 'api:guided-tours', input: 'tours' },
  output: [guidedTourDataRef],
  dataRefs: { tour: guidedTourDataRef },
  factory(params: GuidedTourParams, { node }) {
    const { id, ...rest } = params;
    return [
      guidedTourDataRef({
        id: id ?? node.spec.id.replace(/^guided-tour:/, ''),
        ...rest,
      }),
    ];
  },
});
