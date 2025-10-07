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

import { renderInTestApp } from '@backstage/test-utils';
import { ServiceDetailsContent } from './ServiceDetailsContent';
import { mockService, mockUser1, mockUser2 } from '../../mocks';

describe('<ServiceDetailsContent />', () => {
  it('should render', async () => {
    const component = await renderInTestApp(
      <ServiceDetailsContent
        details={mockService}
        owner={mockUser1}
        delegate={mockUser2}
      />,
    );
    expect(component).toBeDefined();
  });
  it('should display application name field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('Application Name').nodeName).toEqual('H2');
    expect(getByText(mockService.name).nodeName).toEqual('P');
  });
  it('should display application app code field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('App Code').nodeName).toEqual('H2');
    expect(getByText(mockService.u_application_id).nodeName).toEqual('SPAN');
    expect(
      getByText(mockService.u_application_id).classList.contains(
        'MuiChip-label',
      ),
    ).toBeTruthy();
  });
  it('should display application service criticality field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('Service Criticality').nodeName).toEqual('H2');
    expect(getByText(mockService.business_criticality).nodeName).toEqual('P');
  });
  it('should display application service owner field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('Service Owner').nodeName).toEqual('H2');
  });
  it('should display application service delegate field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('Service Owner').nodeName).toEqual('H2');
  });
  it('should display application support contact email field', async () => {
    const { getByText } = await renderInTestApp(
      <ServiceDetailsContent details={mockService} />,
    );
    expect(getByText('Support Contact Email').nodeName).toEqual('H2');
    expect(getByText(mockService.u_support_contact_email).nodeName).toEqual(
      'P',
    );
  });
});
