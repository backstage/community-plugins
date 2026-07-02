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

// Type shims for packages whose internal .d.ts files have prosemirror
// version incompatibilities. These declarations prevent TypeScript from
// crawling into @toast-ui/editor/types/* when skipLibCheck is false.
// Note: @toast-ui/react-editor is redirected via tsconfig paths to
// typings/toast-ui-react-editor.d.ts — no ambient shim needed here.
declare module '@toast-ui/editor' {
  const Editor: any;
  export default Editor;
}

declare module '@toast-ui/editor/dist/toastui-editor-viewer' {
  const Viewer: any;
  export default Viewer;
}
