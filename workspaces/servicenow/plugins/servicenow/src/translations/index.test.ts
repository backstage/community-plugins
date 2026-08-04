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
import { servicenowTranslationsModule } from '../index';

describe('servicenowTranslationsModule', () => {
  it('exports the translations module as the default export', () => {
    expect(defaultExport).toBeDefined();
  });

  it('re-exports the translations module from the main index', () => {
    expect(servicenowTranslationsModule).toBe(defaultExport);
  });
});
