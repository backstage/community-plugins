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
import { XcmetricsLayout } from './XcmetricsLayout';
import { xcmetricsApiRef } from '../../api';
import userEvent from '@testing-library/user-event';

jest.mock('../../api/XcmetricsClient');
const client = require('../../api/XcmetricsClient');

jest.mock('../Overview', () => ({
  Overview: () => 'OverviewComponent',
}));

jest.mock('../BuildList', () => ({
  BuildList: () => 'BuildList',
}));

describe('XcmetricsLayout', () => {
  it('should render', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <XcmetricsLayout />
      </TestApiProvider>,
    );

    expect(rendered.getByText('Overview')).toBeInTheDocument();
    expect(rendered.getByText('Builds')).toBeInTheDocument();

    expect(rendered.getByText('OverviewComponent')).toBeInTheDocument();
  });

  it('should show a list of builds when the Builds tab is selected', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <XcmetricsLayout />
      </TestApiProvider>,
    );

    await userEvent.click(rendered.getByText('Builds'));
    expect(await rendered.findByText('BuildList')).toBeInTheDocument();
  });
});
