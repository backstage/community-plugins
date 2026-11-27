/*
 * Copyright 2025 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { waitFor } from '@testing-library/react';

import { MaturityPage } from './MaturityPage';
import { MaturityApi, maturityApiRef } from '../../api';

const catalogApi: Partial<CatalogApi> = {
  getEntities: jest.fn().mockResolvedValue([]),
};

const scoringApi: Partial<MaturityApi> = {
  getBulkMaturityCheckResults: jest.fn().mockResolvedValue([]),
};

describe('<MaturityPage />', () => {
  afterEach(() => jest.resetAllMocks());

  it('shows maturity index page', async () => {
    const { getAllByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [maturityApiRef, scoringApi],
        ]}
      >
        <MaturityPage />
      </TestApiProvider>,
    );

    expect(getAllByText(/Maturity/)).toHaveLength(1);
  });

  it('requests check results once, for the Components it loaded', async () => {
    const components: Entity[] = ['a', 'b'].map(name => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name, namespace: 'default' },
    }));
    const getBulkMaturityCheckResults = jest.fn().mockResolvedValue([]);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            catalogApiRef,
            { getEntities: jest.fn().mockResolvedValue({ items: components }) },
          ],
          [maturityApiRef, { getBulkMaturityCheckResults }],
        ]}
      >
        <MaturityPage />
      </TestApiProvider>,
    );

    await waitFor(() => expect(getBulkMaturityCheckResults).toHaveBeenCalled());
    expect(getBulkMaturityCheckResults).toHaveBeenCalledTimes(1);
    expect(getBulkMaturityCheckResults).toHaveBeenCalledWith(components);
  });

  it('shows the catalog error instead of requesting check results', async () => {
    const getBulkMaturityCheckResults = jest.fn().mockResolvedValue([]);

    const { findAllByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            catalogApiRef,
            {
              getEntities: jest
                .fn()
                .mockRejectedValue(new Error('catalog is down')),
            },
          ],
          [maturityApiRef, { getBulkMaturityCheckResults }],
        ]}
      >
        <MaturityPage />
      </TestApiProvider>,
    );

    expect((await findAllByText(/catalog is down/)).length).toBeGreaterThan(0);
    expect(getBulkMaturityCheckResults).not.toHaveBeenCalled();
  });

  it('shows an empty state instead of requesting check results when there are no Components', async () => {
    const getBulkMaturityCheckResults = jest.fn().mockResolvedValue([]);

    const { findByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            catalogApiRef,
            { getEntities: jest.fn().mockResolvedValue({ items: [] }) },
          ],
          [maturityApiRef, { getBulkMaturityCheckResults }],
        ]}
      >
        <MaturityPage />
      </TestApiProvider>,
    );

    expect(await findByText('No Components to rank')).toBeInTheDocument();
    expect(getBulkMaturityCheckResults).not.toHaveBeenCalled();
  });
});
