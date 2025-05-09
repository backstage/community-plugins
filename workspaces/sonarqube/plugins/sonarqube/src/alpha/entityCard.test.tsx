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
  TestApiProvider,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { entitySonarQubeCard } from './entityCard';
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
