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
  createFrontendPlugin,
  PageBlueprint,
  ApiBlueprint,
  ExtensionDefinition,
  FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { Entity } from '@backstage/catalog-model';
import {
  TechDocsEditorApiRef,
  TechDocsEditorClient,
} from '@backstage-community/plugin-techdocs-editor-react';
import { editorRouteRef } from '../routes';
import { EditorPageContent } from '../components/EditorPageContent';
import { EntityEditorContent } from '../components/EntityEditorContent';

const TECHDOCS_ANNOTATION = 'backstage.io/techdocs-ref';
const TECHDOCS_ENTITY_ANNOTATION = 'backstage.io/techdocs-entity';

/** Show the Edit Docs tab for entities that have either TechDocs annotation. */
function hasTechDocsAnnotation(entity: Entity): boolean {
  const annotations = entity.metadata.annotations ?? {};
  return Boolean(
    annotations[TECHDOCS_ANNOTATION] || annotations[TECHDOCS_ENTITY_ANNOTATION],
  );
}

// ── API ──────────────────────────────────────────────────────────────────────

const techdocsEditorApiExtension = ApiBlueprint.make({
  name: 'techdocs-editor',
  params: defineParams =>
    defineParams({
      api: TechDocsEditorApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new TechDocsEditorClient(discoveryApi, fetchApi),
    }),
});

// ── Standalone editor page ───────────────────────────────────────────────────

/**
 * @alpha
 */
export const techdocsEditorExtensionPage = PageBlueprint.make({
  name: 'techdocs-editor',
  params: {
    path: '/docs/:namespace/:kind/:name/edit',
    routeRef: editorRouteRef,
    loader: async () => <EditorPageContent />,
  },
});

// ── Entity content tab ───────────────────────────────────────────────────────

/**
 * @alpha
 */
export const techdocsEditorAddonExtension: ExtensionDefinition =
  EntityContentBlueprint.make({
    name: 'techdocs-editor',
    params: {
      path: '/edit-docs',
      title: 'Edit Docs',
      filter: hasTechDocsAnnotation,
      loader: async () => <EntityEditorContent />,
    },
  });

// ── Plugin ───────────────────────────────────────────────────────────────────

/**
 * @alpha
 */
const techdocsEditorAlphaPlugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'techdocs-editor',
  extensions: [
    techdocsEditorApiExtension,
    techdocsEditorExtensionPage,
    techdocsEditorAddonExtension,
  ],
  routes: {
    root: editorRouteRef,
  },
});

export default techdocsEditorAlphaPlugin;
