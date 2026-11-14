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

import { createCatalogModelLayer } from '@backstage/catalog-model/alpha';
import { LINGUIST_ANNOTATION } from './constants';

/**
 * Catalog model layer that declares the annotations used by the Linguist plugin.
 *
 * @alpha
 */
export const linguistCatalogModelLayer = createCatalogModelLayer({
  layerId: 'linguist.backstage.io/annotations',
  builder: model => {
    model.addAnnotation({
      name: LINGUIST_ANNOTATION,
      title: 'Linguist',
      description:
        'A URL to the source code that Linguist should scan to determine the languages used by the entity, e.g. https://github.com/backstage/backstage.',
      schema: {
        jsonSchema: {
          type: 'string',
          // An absolute URL with any scheme, e.g. https://github.com/org/repo
          pattern: '^[a-zA-Z][a-zA-Z0-9+.-]*://\\S+$',
        },
      },
    });
  },
});
