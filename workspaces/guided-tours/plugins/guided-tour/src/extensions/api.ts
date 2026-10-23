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
  createExtensionInput,
  storageApiRef,
} from '@backstage/frontend-plugin-api';
import {
  guidedTourApiRef,
  guidedTourDataRef,
} from '@internal/backstage-plugin-guided-tour-react';
import { z } from 'zod';
import { DefaultGuidedTourApi } from '../api/DefaultGuidedTourApi';

/**
 * `api:guided-tour`: the registry every `guided-tour` extension attaches to.
 */
export const guidedTourApi = ApiBlueprint.makeWithOverrides({
  inputs: {
    tours: createExtensionInput([guidedTourDataRef]),
  },
  configSchema: {
    /** Set to false to never start tours on their own (e2e runs, kiosks). */
    autoStart: z.boolean().default(true),
  },
  factory: (originalFactory, { inputs, config }) =>
    originalFactory(defineParams =>
      defineParams({
        api: guidedTourApiRef,
        deps: { storageApi: storageApiRef },
        factory: ({ storageApi }) =>
          new DefaultGuidedTourApi({
            tours: inputs.tours.map(t => t.get(guidedTourDataRef)),
            storageApi,
            autoStart: config.autoStart,
          }),
      }),
    ),
});
