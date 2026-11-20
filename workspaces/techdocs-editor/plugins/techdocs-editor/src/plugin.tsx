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

import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  TechDocsEditorApiRef,
  TechDocsEditorClient,
} from '@backstage-community/plugin-techdocs-editor-react';
import { editorRouteRef } from './routes';

/**
 * Classic (old frontend system) plugin for the in-app TechDocs editor.
 *
 * Registers the `TechDocsEditorApiRef` implementation and provides the
 * routable editor page and the entity content extensions.
 *
 * @public
 */
export const techdocsEditorPlugin = createPlugin({
  id: 'techdocs-editor',
  apis: [
    createApiFactory({
      api: TechDocsEditorApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new TechDocsEditorClient(discoveryApi, fetchApi),
    }),
  ],
  routes: {
    root: editorRouteRef,
  },
});

/**
 * Standalone routable page for the TechDocs editor. Add it to your app's
 * `FlatRoutes` at a path that matches the editor route params, for example
 * `path="/docs/:namespace/:kind/:name/edit"`.
 *
 * @public
 */
export const TechdocsEditorPage = techdocsEditorPlugin.provide(
  createRoutableExtension({
    name: 'TechdocsEditorPage',
    mountPoint: editorRouteRef,
    component: () =>
      import('./components/EditorPageContent').then(m => m.EditorPageContent),
  }),
);

/**
 * Entity content for the TechDocs editor. Add it to your catalog entity page
 * inside an `EntityLayout.Route`.
 *
 * @public
 */
export const EntityTechdocsEditorContent = techdocsEditorPlugin.provide(
  createComponentExtension({
    name: 'EntityTechdocsEditorContent',
    component: {
      lazy: () =>
        import('./components/EntityEditorContent').then(
          m => m.EntityEditorContent,
        ),
    },
  }),
);
