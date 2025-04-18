/*
 * Copyright 2021 The Backstage Authors
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

import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import {
  EntityValidationPage,
  EntityValidationContent,
} from './EntityValidationPage';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { MarkdownContent } from '@backstage/core-components';

const catalogApi: Partial<CatalogApi> = {
  getEntities: () =>
    Promise.resolve({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'Entity1',
            annotations: {
              'backstage.io/view-url': 'viewurl',
              'backstage.io/edit-url': 'editurl',
            },
          },
          spec: { type: 'openapi' },
        },
      ],
    }),
};

describe('EntityValidatorContent', () => {
  const contentHead = <MarkdownContent content="Content Head" />;

  it('should show location text field', async () => {
    const { getByText, getByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityValidationContent />
      </TestApiProvider>,
    );
    const mainGrid = getByTestId('main-grid');

    expect(mainGrid.children.length).toBe(2);
    expect(getByText('File Location')).toBeInTheDocument();
  });

  it('should not show location text field', async () => {
    const { queryByText, getByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityValidationContent hideFileLocationField />
      </TestApiProvider>,
    );
    const mainGrid = getByTestId('main-grid');

    expect(mainGrid.children.length).toBe(1);
    expect(queryByText('File Location')).not.toBeInTheDocument();
  });

  it('should not show content head', async () => {
    const { getByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityValidationContent />
      </TestApiProvider>,
    );
    const mainGrid = getByTestId('main-grid');

    expect(mainGrid.children.length).toBe(2);
  });

  it('should show content head', async () => {
    const { getByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityValidationContent contentHead={contentHead} />
      </TestApiProvider>,
    );
    const mainGrid = getByTestId('main-grid');

    expect(mainGrid.children.length).toBe(3);
  });
});

describe('EntityValidatorPage', () => {
  it('should load the Content element', async () => {
    const { getByText, getByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityValidationPage />
      </TestApiProvider>,
    );

    const mainGrid = getByTestId('main-grid');

    expect(mainGrid.children.length).toBe(2);
    expect(getByText('File Location')).toBeInTheDocument();
  });
});
