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

import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderInTestApp } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  EntityTechdocsEditorContent,
  TechdocsEditorPage,
  techdocsEditorPlugin,
} from './plugin';
import { editorRouteRef } from './routes';
import { TechDocsEditPageAddon } from './addons/TechDocsEditPageAddon';

jest.mock('@backstage-community/plugin-techdocs-editor-react', () => ({
  ...jest.requireActual('@backstage-community/plugin-techdocs-editor-react'),
  TechDocsEditorPage: (props: {
    entityRef: { namespace?: string; kind: string; name: string };
    initialPath?: string;
    hasTechDocsAnnotation?: boolean;
  }) => (
    <div data-testid="editor-page">
      {`${props.entityRef.kind}/${props.entityRef.namespace ?? 'default'}/${
        props.entityRef.name
      }`}
      <span data-testid="initial-path">{props.initialPath ?? ''}</span>
      <span data-testid="has-annotation">
        {String(props.hasTechDocsAnnotation ?? true)}
      </span>
    </div>
  ),
}));

describe('techdocsEditorPlugin (classic)', () => {
  it('exposes the plugin id, root route, and editor extensions', () => {
    expect(techdocsEditorPlugin.getId()).toBe('techdocs-editor');
    expect(techdocsEditorPlugin.routes.root).toBe(editorRouteRef);
    expect(TechdocsEditorPage).toBeDefined();
    expect(EntityTechdocsEditorContent).toBeDefined();
  });

  it('exports the edit-page addon as a renderable component', () => {
    // A raw addon extension object (not passed through `plugin.provide`)
    // makes React throw "Element type is invalid" when mounted in the
    // classic TechDocsAddons.
    expect(typeof TechDocsEditPageAddon).toBe('function');
  });

  it('renders the routable editor page from route params and the file query', async () => {
    await renderInTestApp(
      <Routes>
        <Route
          path="/docs/:namespace/:kind/:name/edit"
          element={<TechdocsEditorPage />}
        />
      </Routes>,
      {
        routeEntries: ['/docs/default/component/website/edit?file=index.md'],
        mountedRoutes: {
          '/docs/:namespace/:kind/:name/edit': editorRouteRef,
        },
      },
    );

    expect((await screen.findByTestId('editor-page')).textContent).toContain(
      'component/default/website',
    );
    expect(screen.getByTestId('initial-path').textContent).toBe('index.md');
  });

  it('renders the entity content for a TechDocs entity', async () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'website',
        namespace: 'default',
        annotations: { 'backstage.io/techdocs-ref': 'dir:.' },
      },
      spec: { type: 'website' },
    };

    await renderInTestApp(
      <EntityProvider entity={entity}>
        <EntityTechdocsEditorContent />
      </EntityProvider>,
    );

    expect((await screen.findByTestId('editor-page')).textContent).toContain(
      'Component/default/website',
    );
    expect(screen.getByTestId('has-annotation').textContent).toBe('true');
  });

  it('passes hasTechDocsAnnotation=false when the entity has no annotation', async () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'no-docs', namespace: 'default' },
      spec: { type: 'service' },
    };

    await renderInTestApp(
      <EntityProvider entity={entity}>
        <EntityTechdocsEditorContent />
      </EntityProvider>,
    );

    expect((await screen.findByTestId('has-annotation')).textContent).toBe(
      'false',
    );
  });
});
