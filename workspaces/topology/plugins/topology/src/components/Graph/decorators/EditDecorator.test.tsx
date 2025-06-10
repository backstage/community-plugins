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
import { Node } from '@patternfly/react-topology';
import { render } from '@testing-library/react';

import EditDecorator from './EditDecorator';

jest.mock('../../Icons/RouteDecoratorIcon', () => {
  return ({ routeURL }: any) =>
    routeURL && <svg data-testid="mocked-icon">Mocked Icon</svg>;
});

jest.mock('./Decorator', () => {
  const MockDecorator = ({ href, children }: any) => (
    <a data-testid="mocked-decorator" href={href}>
      {children}
    </a>
  );

  return MockDecorator;
});

jest.mock('@patternfly/react-core', () => {
  const MockedTooltip = ({ content, children }: any) => (
    <div>
      {content}
      {children}
    </div>
  );

  return {
    ...jest.requireActual('@patternfly/react-core'),
    Tooltip: MockedTooltip,
  };
});

describe('EditDecorator', () => {
  it('renders EditDecorator with valid repoIcon and Tooltip', () => {
    const elementMock = {
      getData: () => ({
        data: {
          editURL: 'https://example.com/edit',
          vcsURI: 'https://example.com/repo',
          vcsRef: 'main',
          cheCluster: null,
        },
      }),
    } as Node;
    const radius = 20;
    const x = 100;
    const y = 50;

    const { getByText, getByTestId } = render(
      <EditDecorator element={elementMock} radius={radius} x={x} y={y} />,
    );

    const editIcon = getByText('Edit source code');
    expect(editIcon).toBeInTheDocument();

    const tooltipContent = getByText('Edit source code');
    expect(tooltipContent).toBeInTheDocument();

    const mockedIcon = getByTestId('mocked-icon');
    expect(mockedIcon).toBeInTheDocument();
  });

  it('renders EditDecorator with valid repoIcon and custom cheCluster data', () => {
    const elementMock = {
      getData: () => ({
        data: {
          editURL: null,
          vcsURI: 'https://example.com/repo',
          vcsRef: 'main',
          cheCluster: 'https://che.example.com',
        },
      }),
    } as Node;
    const radius = 20;
    const x = 100;
    const y = 50;

    const { getByText, getByTestId } = render(
      <EditDecorator element={elementMock} radius={radius} x={x} y={y} />,
    );

    const editIcon = getByText('Edit source code');
    expect(editIcon).toBeInTheDocument();

    const mockedIcon = getByTestId('mocked-icon');
    expect(mockedIcon).toBeInTheDocument();
  });
});
