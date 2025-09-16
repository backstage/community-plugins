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
import { ServiceDetailsField } from './ServiceDetailsField';

describe('<ServiceDetailsField>', () => {
  it('should render', async () => {
    const fieldComponent = await renderInTestApp(
      <ServiceDetailsField label="Field Label" />,
    );
    expect(fieldComponent).toBeDefined();
  });
  it('should render a field with a label', async () => {
    const fieldComponent = await renderInTestApp(
      <ServiceDetailsField label="Field Label" />,
    );
    expect(fieldComponent.getByText('Field Label')).toBeDefined();
    expect(fieldComponent.getByText('Field Label').nodeName).toEqual('H2');
  });
  it('should render a field with a label and value', async () => {
    const fieldComponent = await renderInTestApp(
      <ServiceDetailsField label="Field Label" value="Field Value" />,
    );
    expect(fieldComponent.getByText('Field Label')).toBeDefined();
    expect(fieldComponent.getByText('Field Label').nodeName).toEqual('H2');
    expect(fieldComponent.getByText('Field Value')).toBeDefined();
    expect(fieldComponent.getByText('Field Value').nodeName).toEqual('P');
  });
  it('should render a field with a label and child component', async () => {
    const fieldComponent = await renderInTestApp(
      <ServiceDetailsField label="Field Label">
        <div>Child Component</div>
      </ServiceDetailsField>,
    );
    expect(fieldComponent.getByText('Field Label')).toBeDefined();
    expect(fieldComponent.getByText('Field Label').nodeName).toEqual('H2');
    expect(fieldComponent.getByText('Child Component')).toBeDefined();
    expect(fieldComponent.getByText('Child Component').nodeName).toEqual('DIV');
  });
});
