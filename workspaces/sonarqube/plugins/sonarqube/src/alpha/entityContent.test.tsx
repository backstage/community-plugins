import { screen, waitFor } from '@testing-library/react';
import { entitySonarQubeContent } from './entityContent';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { SonarQubeClient } from '../api';
import React from 'react';
import {
  sonarQubeApiRef,
  SONARQUBE_PROJECT_KEY_ANNOTATION,
} from '@backstage-community/plugin-sonarqube-react';

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

describe('Entity content extensions', () => {
  const mockSonarQubeApi = {} as unknown as SonarQubeClient;

  it('should render the SonarQube Dashboard on an entity', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[sonarQubeApiRef, mockSonarQubeApi]]}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(entitySonarQubeContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('SonarQube Dashboard')).toBeInTheDocument();
    });
  });
});
