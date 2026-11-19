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
import { Route, Routes } from 'react-router-dom';
import { Header, Page } from '@backstage/core-components';
import { TemplateEditor } from './TemplateEditor';
import { TemplateList } from './TemplateList';

/**
 * Page for creating, editing and previewing stored MDX card templates.
 *
 * @public
 */
export const MdxCardEditorPage = () => (
  <Routes>
    <Route path="/" element={<TemplateList />} />
    <Route path="/new" element={<TemplateEditor />} />
    <Route path="/edit/:id" element={<TemplateEditor />} />
  </Routes>
);

export const LegacyMdxCardEditorPage = () => (
  <Page themeId="tool">
    <Header title="MDX Cards" />
    <MdxCardEditorPage />
  </Page>
);
