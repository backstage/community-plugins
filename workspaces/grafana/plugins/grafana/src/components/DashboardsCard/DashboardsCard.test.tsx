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

import { DashboardsTable } from './DashboardsCard';
import { renderInTestApp } from '@backstage/test-utils';

describe('DashboardsTable', () => {
  const entityMock = {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'mocked-service',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    spec: {
      type: 'service',
      owner: 'John Doe',
      lifecycle: 'experimental',
    },
  };

  it('should render even with no dashboards', async () => {
    const rendered = await renderInTestApp(
      <DashboardsTable dashboards={[]} entity={entityMock} opts={{}} />,
    );

    expect(
      await rendered.findByText('No records to display'),
    ).toBeInTheDocument();
  });
});
