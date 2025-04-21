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
import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import AppNamespace from '../AppNamespace';

describe('AppNamespace', () => {
  test('should not render if the application is not available', () => {
    render(<AppNamespace app={null as unknown as Application} />);
    expect(
      screen.queryByText(mockApplication.spec.destination.namespace),
    ).not.toBeInTheDocument();
  });

  test('should render the namespace application is available', () => {
    render(<AppNamespace app={mockApplication} />);

    expect(
      screen.queryByText(mockApplication.spec.destination.namespace),
    ).toBeInTheDocument();
  });
});
