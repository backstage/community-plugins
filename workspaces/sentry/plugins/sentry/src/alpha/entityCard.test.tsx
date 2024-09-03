import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { entitySentryCard } from './entityCard';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { sentryApiRef, MockSentryApi } from '../api';
import {
  sampleEntity,
  sampleEntityWithoutAnnotation,
} from '../__fixtures__/entity';
import React from 'react';

describe('Entity content extension', () => {
  it('should render Sentry issues card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[sentryApiRef, new MockSentryApi()]]}>
        <EntityProvider entity={sampleEntity}>
          {createExtensionTester(entitySentryCard).reactElement()}
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
      <TestApiProvider apis={[[sentryApiRef, new MockSentryApi()]]}>
        <EntityProvider entity={sampleEntityWithoutAnnotation}>
          {createExtensionTester(entitySentryCard).reactElement()}
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
