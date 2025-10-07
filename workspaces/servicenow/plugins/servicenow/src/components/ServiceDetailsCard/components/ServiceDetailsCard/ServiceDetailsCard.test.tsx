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

import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { ServiceDetailsCard } from './ServiceDetailsCard';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { useServiceDetails } from '../../hooks';
import { mockEntity, mockService, mockUser1 } from '../../mocks';
import { useServiceUser } from '../../hooks/useServiceUser';
import { ConfigApi, configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import { serviceNowApiRef } from '../../../../api/ServiceNowBackendClient';

jest.mock('../../hooks/useServiceDetails', () => ({
  useServiceDetails: jest.fn(),
}));
jest.mock('../../hooks/useServiceUser', () => ({
  useServiceUser: jest.fn(),
}));

const mockServiceNowApi: jest.Mocked<typeof serviceNowApiRef.T> = {
  getIncidents: jest.fn(),
  getBusinessApplication: jest.fn(),
  getUserDetails: jest.fn(),
  getInfraDetails: jest.fn(),
};
const configApi: ConfigApi = new ConfigReader({});

describe('<ServiceDetailsCard>', () => {
  beforeEach(() => {
    (useServiceDetails as jest.Mock).mockReturnValue({
      serviceDetails: mockService,
      loading: false,
    });
    (useServiceUser as jest.Mock).mockReturnValue({
      userInfo: mockUser1,
      loading: false,
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const renderServiceDetailsCard = () => {
    return renderInTestApp(
      <TestApiProvider
        apis={[
          [serviceNowApiRef, mockServiceNowApi],
          [configApiRef, configApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <ServiceDetailsCard />
        </EntityProvider>
      </TestApiProvider>,
    );
  };

  it('should render', async () => {
    const component = await renderServiceDetailsCard();
    expect(component).toBeDefined();
  });
  it('should have title', async () => {
    const { getByText } = await renderServiceDetailsCard();
    expect(getByText('CMDB Details')).toBeInTheDocument();
  });
  it('should have a the service details fields', async () => {
    const { getByText, getAllByText } = await renderServiceDetailsCard();
    expect(getByText(mockService.name)).toBeDefined();
    expect(getByText(mockService.u_application_id)).toBeDefined();
    expect(getByText(mockService.business_criticality)).toBeDefined();
    expect(getAllByText(mockUser1.name).length).toEqual(2);
    expect(getByText(mockService.u_support_contact_email)).toBeDefined();
  });
});
