import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { entitySonarQubeCard } from './entityCard';
import React from 'react';
import { SonarQubeClient } from '../api';
import {
  sonarQubeApiRef,
  SONARQUBE_PROJECT_KEY_ANNOTATION,
} from '@backstage-community/plugin-sonarqube-react';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const mockedEntity = {
  metadata: {
    name: 'mock',
    namespace: 'default',
    annotations: {
      [SONARQUBE_PROJECT_KEY_ANNOTATION]: 'foo/bar',
    },
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
};

describe('Entity cards extensions', () => {
  const mockSonarQubeApi = {} as unknown as SonarQubeClient;

  it('should render the Code Quality card on an entity', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[sonarQubeApiRef, mockSonarQubeApi]]}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(entitySonarQubeCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Code Quality')).toBeInTheDocument();
    });
  });
});
