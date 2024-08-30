import React from 'react';

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import { waitFor } from '@testing-library/react';

import { FeedbackAPI, feedbackApiRef } from '../../api';
import { mockFeedback } from '../../mocks';
import { rootRouteRef } from '../../routes';
import { FeedbackTable } from './FeedbackTable';

jest.mock('@backstage/plugin-catalog-react', () => ({
  EntityRefLink: (props: { entityRef: string }) => (
    <a href="https://localhost">{props.entityRef}</a>
  ),
  EntityPeekAheadPopover: (props: { children?: React.ReactNode }) => (
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
    expect(
      await waitFor(
        () => rendered.getByRole('button', { name: 'First Page' }),
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();

    expect(
      await waitFor(() =>
        rendered.getByRole('button', { name: 'Previous Page' }),
      ),
    ).toBeInTheDocument();

    expect(
      await waitFor(() => rendered.getByRole('button', { name: 'Next Page' })),
    ).toBeInTheDocument();

    expect(
      await waitFor(() => rendered.getByRole('button', { name: 'Last Page' })),
    ).toBeInTheDocument();
  });
});
