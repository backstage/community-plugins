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
import { JAEGER_SERVICE_ANNOTATION } from '@backstage-community/plugin-jaeger-common';
import { Entity } from '@backstage/catalog-model';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { screen, waitFor } from '@testing-library/react';
import { JaegerApi, jaegerApiRef } from '../api';
import { rootRouteRef } from '../routes';
import { isJaegerAvailable } from '../utils';
import { jaegerApi as jaegerApiExtension } from './apis';
import { jaegerEntityContent } from './entityContents';
// Imported from the public `./alpha` entry point rather than `./plugin`, so the
// test also covers what consumers actually get when installing the plugin.
import jaegerPlugin from './index';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'jaeger-service',
    annotations: {
      [JAEGER_SERVICE_ANNOTATION]: 'jaeger-service',
    },
  },
};

const trace = {
  traceID: 'trace-1',
  spans: [
    { spanID: 'span-1', startTime: 1_000_000, duration: 500_000 },
    { spanID: 'span-2', startTime: 1_500_000, duration: 250_000 },
  ],
};

const jaegerApiMock: JaegerApi = {
  getTraces: async () => ({ data: [trace] }),
};

describe('jaegerPlugin (alpha)', () => {
  it('registers the API and entity content extensions', () => {
    expect(jaegerPlugin.pluginId).toBe('jaeger');
    // The extension tester namespaces extensions under its own test plugin, so
    // only the kind is asserted here — the plugin-scoped ids (`api:jaeger` and
    // `entity-content:jaeger`) are pinned by report-alpha.api.md.
    expect(createExtensionTester(jaegerApiExtension).snapshot().id).toMatch(
      /^api:/,
    );
    expect(createExtensionTester(jaegerEntityContent).snapshot().id).toMatch(
      /^entity-content:/,
    );
  });

  it('keeps the legacy `root` route contract', () => {
    expect(jaegerPlugin.routes.root).toBe(rootRouteRef);
  });

  it('renders the Traces entity content', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[jaegerApiRef, jaegerApiMock]] as const}>
        <EntityProvider entity={entity}>
          {createExtensionTester(jaegerEntityContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Trace List')).toBeInTheDocument();
    });
  });

  it('only offers the Traces tab for entities with a Jaeger annotation', () => {
    expect(isJaegerAvailable(entity)).toBe(true);
    expect(
      isJaegerAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'no-jaeger' },
      }),
    ).toBe(false);
  });
});
