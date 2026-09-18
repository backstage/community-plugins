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
import defaultExport from './index';
import { argocdTranslationsModule } from '../index';
import { argocdTranslations, argocdTranslationRef } from '../legacy';

describe('argocdTranslationsModule', () => {
  it('exports the translations module as the default export', () => {
    expect(defaultExport).toBeDefined();
  });

  it('re-exports the translations module from the package root', () => {
    expect(argocdTranslationsModule).toBe(defaultExport);
  });

  it('exports the translation resource and ref from the legacy entry', () => {
    expect(argocdTranslations).toBeDefined();
    expect(argocdTranslationRef).toBeDefined();
  });
});
