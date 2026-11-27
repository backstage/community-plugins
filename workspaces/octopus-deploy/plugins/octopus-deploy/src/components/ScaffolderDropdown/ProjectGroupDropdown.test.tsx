/*
 * Copyright 2026 The Backstage Authors
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
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import { ProjectGroupDropdown } from './ProjectGroupDropdown';
import { octopusDeployApiRef, OctopusDeployApi } from '../../api';

describe('ProjectGroupDropdown', () => {
  it('passes disabled, required and invalid state to the fallback field', async () => {
    const api: Partial<OctopusDeployApi> = {
      getProjectGroups: jest.fn().mockResolvedValue([]),
    };
    const props = {
      onChange: jest.fn(),
      required: true,
      disabled: true,
      rawErrors: ['Project group is required'],
    } as unknown as FieldExtensionComponentProps<string>;

    await renderInTestApp(
      <TestApiProvider apis={[[octopusDeployApiRef, api]]}>
        <ProjectGroupDropdown {...props} />
      </TestApiProvider>,
    );

    const input = await screen.findByRole('textbox', { name: /Project Group/ });
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
  });
});
