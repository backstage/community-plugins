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
import userEvent from '@testing-library/user-event';
import { StatusCell } from './StatusCell';
import { xcmetricsApiRef } from '../../api';
import { formatDuration, formatStatus } from '../../utils';

jest.mock('../../api/XcmetricsClient');
const client = require('../../api/XcmetricsClient');

describe('StatusCell', () => {
  it('should render', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider apis={[[xcmetricsApiRef, client.XcmetricsClient]]}>
        <StatusCell
          buildStatus={{
            id: client.mockBuild.id,
            buildStatus: client.mockBuild.buildStatus,
          }}
          size={10}
          spacing={10}
        />
      </TestApiProvider>,
    );

    await userEvent.hover(rendered.getByTestId(client.mockBuild.id));
    expect(
      await rendered.findByText(formatStatus(client.mockBuild.buildStatus)),
    ).toBeInTheDocument();
    expect(
      await rendered.findByText(
        formatDuration(client.mockBuild.duration).trim(),
      ),
    ).toBeInTheDocument();
  });
});
