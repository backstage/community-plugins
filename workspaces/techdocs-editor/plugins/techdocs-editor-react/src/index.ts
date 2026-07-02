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

/**
 * Shared React components for the TechDocs in-app editor.
 *
 * @packageDocumentation
 */

export { TechDocsEditorPage } from './components/TechDocsEditorPage';
export type { TechDocsEditorPageProps } from './components/TechDocsEditorPage';
export { TechDocsFileTree } from './components/TechDocsFileTree';
export type { TechDocsFileTreeProps } from './components/TechDocsFileTree';
export { TechDocsMarkdownEditor } from './components/TechDocsMarkdownEditor';
export type { TechDocsMarkdownEditorProps } from './components/TechDocsMarkdownEditor';
export { SubmitEditsDialog } from './components/SubmitEditsDialog';
export type { SubmitEditsDialogProps } from './components/SubmitEditsDialog';
export {
  useTechDocsEditorApi,
  TechDocsEditorApiRef,
  TechDocsEditorClient,
} from './api';
export type { TechDocsEditorApi } from './api';
