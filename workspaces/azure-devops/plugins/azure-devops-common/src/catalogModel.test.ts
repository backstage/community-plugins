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
  compileCatalogModel,
  defaultCatalogEntityModel,
} from '@backstage/catalog-model/alpha';
import { azureDevOpsCatalogModelLayer } from './catalogModel';

describe('azureDevOpsCatalogModelLayer', () => {
  it('compiles alongside the default model and declares all annotations', () => {
    const model = compileCatalogModel([
      defaultCatalogEntityModel,
      azureDevOpsCatalogModelLayer,
    ]);

    const names = model
      .getMetadata()
      .annotations.map(a => a.name)
      .filter(name => name.startsWith('dev.azure.com/'))
      .sort();

    expect(names).toEqual([
      'dev.azure.com/build-definition',
      'dev.azure.com/host-org',
      'dev.azure.com/project',
      'dev.azure.com/project-repo',
      'dev.azure.com/readme-path',
    ]);
  });
});
