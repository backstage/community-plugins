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

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import { waitFor } from '@testing-library/react';

import { ReactNode } from 'react';
import { FeedbackAPI, feedbackApiRef } from '../../api';
import { mockFeedback } from '../../mocks';
import { rootRouteRef } from '../../routes';
import { FeedbackTable } from './FeedbackTable';

jest.mock('@backstage/plugin-catalog-react', () => ({
  EntityRefLink: (props: { entityRef: string }) => (
    <a href="https://localhost">{props.entityRef}</a>
  ),
  EntityPeekAheadPopover: (props: { children?: ReactNode }) => (
    <>{props.children}</>
  ),
}));

describe('Feedback Table Component', () => {
  const mockFeedbackApi: Partial<FeedbackAPI> = {
    getAllFeedbacks: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: [mockFeedback],
        count: 1,
        currentPage: 1,
        pageSize: 5,
      });
    }),
  };

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider apis={[[feedbackApiRef, mockFeedbackApi]]}>
        <FeedbackTable />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render', async () => {
    const rendered = await render();
    await waitFor(() => {
      expect(rendered).toBeDefined();
      expect(mockFeedbackApi.getAllFeedbacks).toHaveBeenCalledTimes(1);
    });
  });

  it('should render all columns in table table', async () => {
    const rendered = await render();
    expect(rendered.getByText('Summary')).toBeInTheDocument();
    expect(rendered.getByText('Type')).toBeInTheDocument();
    expect(rendered.getByText('Project')).toBeInTheDocument();
    expect(rendered.getByText('Ticket')).toBeInTheDocument();
    expect(rendered.getByText('Tag')).toBeInTheDocument();
  });

  it('should render data in table', async () => {
    const rendered = await render();
    await waitFor(() => {
      expect(rendered.getByText(mockFeedback.summary)).toBeInTheDocument();
      expect(rendered.getByText(mockFeedback.projectId)).toBeInTheDocument();
      expect(
        rendered.getByText(mockFeedback.ticketUrl.split('/').pop()!),
      ).toBeInTheDocument();
      expect(rendered.getByText(mockFeedback.tag)).toBeInTheDocument();
    });
  });

  it('should have pagination buttons', async () => {
    const rendered = await render();

    await waitFor(
      () =>
        expect(
          rendered.getByRole('button', { name: 'First Page' }),
        ).toBeInTheDocument(),
      { timeout: 10000 },
    );

    await waitFor(() =>
      expect(
        rendered.getByRole('button', { name: 'Previous Page' }),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        rendered.getByRole('button', { name: 'Next Page' }),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        rendered.getByRole('button', { name: 'Last Page' }),
      ).toBeInTheDocument(),
    );
  });
});
