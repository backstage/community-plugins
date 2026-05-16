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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { AnnotateScmSlugEntityProcessor } from './processor/AnnotateScmSlugEntityProcessor';

/** @public */
export const catalogModuleAnnotateScmSlug = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'annotate-scm-slug',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ catalog, config }) {
        catalog.addProcessor(AnnotateScmSlugEntityProcessor.fromConfig(config));
      },
    });
  },
});
