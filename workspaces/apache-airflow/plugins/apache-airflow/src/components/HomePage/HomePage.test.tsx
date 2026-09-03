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

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

jest.mock('../DagTableComponent', () => ({
  DagTableComponent: () => <div>DagTableComponent</div>,
}));
jest.mock('../StatusComponent', () => ({
  StatusComponent: () => <div>StatusComponent</div>,
}));
jest.mock('../VersionComponent', () => ({
  VersionComponent: () => <div>VersionComponent</div>,
}));
jest.mock('@backstage/core-components', () => ({
  Content: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ContentHeader: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  Header: ({ children, title }: { children?: ReactNode; title?: string }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
  HeaderLabel: ({ label, value }: { label?: string; value?: string }) => (
    <span>{label ? `${label}: ${value}` : value}</span>
  ),
  Page: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SupportButton: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));
import { HomePage } from './HomePage';

describe('<HomePage />', () => {
  it('homepage should render', async () => {
    render(<HomePage />);
    expect(screen.getByText('Apache Airflow')).toBeInTheDocument();
  });
});
