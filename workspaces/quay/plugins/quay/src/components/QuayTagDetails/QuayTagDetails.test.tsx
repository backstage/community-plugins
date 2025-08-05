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
import { renderInTestApp } from '@backstage/test-utils';

import data from '../../api/fixtures/securityDetail/foo.json';
import { Layer } from '../../types';
import QuayTagDetails from './component';

describe('QuayTagDetails', () => {
  it('should render tag details if vulnerabilities exists', async () => {
    const { queryByText } = await renderInTestApp(
      <QuayTagDetails
        layer={data.data.Layer as Layer}
        rootLink={jest.fn()}
        digest="data-digest"
      />,
    );
    expect(queryByText(/Back to repository/i)).toBeInTheDocument();
    expect(queryByText(/Vulnerabilities for data-digest/i)).toBeInTheDocument();
  });
});
