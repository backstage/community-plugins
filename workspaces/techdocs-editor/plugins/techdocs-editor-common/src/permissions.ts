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

import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permission to read (open editor, view source file tree) for TechDocs content.
 * @public
 */
export const techdocsEditorReadPermission = createPermission({
  name: 'techdocs.editor.read',
  attributes: { action: 'read' },
});

/**
 * Permission to write (submit edits as PR) for TechDocs content.
 * @public
 */
export const techdocsEditorWritePermission = createPermission({
  name: 'techdocs.editor.write',
  attributes: { action: 'update' },
});
