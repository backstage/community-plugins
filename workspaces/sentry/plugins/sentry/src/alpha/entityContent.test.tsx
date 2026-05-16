/*
 * Copyright 2024 The Backstage Authors
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
import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { entitySentryContent } from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { sentryApiRef, MockSentryApi } from '../api';
import {
  sampleEntity,
  sampleEntityWithoutAnnotation,
} from '../__fixtures__/entity';

describe('Entity content extension', () => {
  it('should render Sentry tab', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[sentryApiRef, new MockSentryApi()]] as const}>
        <EntityProvider entity={sampleEntity}>
          {createExtensionTester(entitySentryContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('sentry-issues-grid')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render missing state without Sentry annotation', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[sentryApiRef, new MockSentryApi()]] as const}>
        <EntityProvider entity={sampleEntityWithoutAnnotation}>
          {createExtensionTester(entitySentryContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Missing Annotation')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
