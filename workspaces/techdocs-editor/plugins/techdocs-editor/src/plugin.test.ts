/*
 * Copyright 2025 The Backstage Authors
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

import { techdocsEditorPlugin } from './plugin';
import { TechDocsEditorApiRef } from '@backstage-community/plugin-techdocs-editor-react';

describe('techdocsEditorPlugin', () => {
  it('has the correct plugin ID', () => {
    expect(techdocsEditorPlugin.getId()).toBe('techdocs-editor');
  });

  it('registers the TechDocsEditorApi factory', () => {
    // getApis() returns an Iterable<AnyApiFactory>
    const apiIds = [...techdocsEditorPlugin.getApis()].map(a => a.api.id);
    expect(apiIds).toContain(TechDocsEditorApiRef.id);
  });
});
