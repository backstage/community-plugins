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

import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { BuildList } from './BuildList';
import { xcmetricsApiRef } from '../../api';
import userEvent from '@testing-library/user-event';

jest.mock('../../api/XcmetricsClient');
const client = require('../../api/XcmetricsClient');

jest.mock('../BuildListFilter', () => ({
  BuildListFilter: () => 'BuildListFilter',
}));

jest.mock('../BuildDetails', () => ({
  withRequest: (component: any) => component,
  BuildDetails: () => 'BuildDetails',
}));

describe('BuildList', () => {
  it('should render', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <BuildList />
      </TestApiProvider>,
    );

    expect(rendered.getByText('Builds')).toBeInTheDocument();
    expect(
      rendered.getByText(client.mockBuild.projectName),
    ).toBeInTheDocument();
  });

  it('should show build details', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <BuildList />
      </TestApiProvider>,
    );

    await userEvent.click(
      (
        await rendered.findAllByLabelText('Detail panel visiblity toggle')
      )[0],
    );
    expect(await rendered.findByText('BuildDetails')).toBeInTheDocument();
  });

  it('should show errors', async () => {
    const message = 'error';
    client.XcmetricsClient.getFilteredBuilds = jest
      .fn()
      .mockRejectedValue({ message });

    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <BuildList />
      </TestApiProvider>,
    );

    expect(rendered.getByText(message)).toBeInTheDocument();
  });
});
