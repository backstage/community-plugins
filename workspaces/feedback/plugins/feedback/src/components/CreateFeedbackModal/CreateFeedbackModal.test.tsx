import React from 'react';

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import { fireEvent } from '@testing-library/react';

import { FeedbackAPI, feedbackApiRef } from '../../api';
import { mockEntity } from '../../mocks';
import { CreateFeedbackModal } from './CreateFeedbackModal';

describe('Create Feedback Modal', () => {
  const feedbackApi: Partial<FeedbackAPI> = {
    createFeedback: jest.fn(),
  };

  const PROJECT_ID = 'component:default/example-website';
  const USER_ID = 'user:default/guest';

  const handleModalClose = jest.fn().mockReturnValue(true);

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider apis={[[feedbackApiRef, feedbackApi]]}>
        <CreateFeedbackModal
          handleModalCloseFn={handleModalClose}
          projectEntity={PROJECT_ID}
          userEntity={USER_ID}
          serverType={mockEntity.metadata.annotations?.['feedback/type']!}
        />
      </TestApiProvider>,
    );

  it('should render', async () => {
    const rendered = await render();
    expect(rendered).toBeDefined();
  });

  it('should render the modal title', async () => {
    const rendered = await render();
    expect(
      rendered.getByText(`Feedback for ${PROJECT_ID.split('/').pop()}`),
    ).toBeInTheDocument();
  });

  test('BUG should be selected', async () => {
    const rendered = await render();
    const tags = rendered.getAllByRole('radio') as any;
    expect(tags[0].checked).toBeTruthy();
    expect(tags[1].checked).not.toBeTruthy();
  });

  it('should render all tags for bug', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('heading', {
        name: 'Select Bug: Slow Loading Not Responsive Navigation UI Issues Other',
      }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Slow Loading' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Not Responsive' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Navigation' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'UI Issues' }),
    ).toBeInTheDocument();
    expect(rendered.getByRole('button', { name: 'Other' })).toBeInTheDocument();
  });

  it('should have correct labels', async () => {
    const rendered = await render();

    expect(
      rendered.getByRole('textbox', { name: 'Summary' }),
    ).toBeInTheDocument();

    expect(
      rendered.getByRole('textbox', { name: 'Description' }),
    ).toBeInTheDocument();
  });

  it('should render submit buttons', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Report Bug' }),
    ).toBeInTheDocument();
  });

  // Select type to feedback
  it('should select type to feedback', async () => {
    const rendered = await render();
    fireEvent.click(rendered.getByRole('radio', { name: 'Feedback' }));

    expect(
      rendered.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument();
  });

  it('should render the modal title for feedback', async () => {
    const rendered = await render();
    fireEvent.click(rendered.getByRole('radio', { name: 'Feedback' }));

    expect(
      rendered.getByText(`Feedback for ${PROJECT_ID.split('/').pop()}`),
    ).toBeInTheDocument();
  });

  it('should render all tags for feedback', async () => {
    const rendered = await render();
    fireEvent.click(rendered.getByRole('radio', { name: 'Feedback' }));

    expect(
      rendered.getByRole('heading', {
        name: 'Select Feedback: Excellent Good Needs Improvement Other',
      }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Excellent' }),
    ).toBeInTheDocument();
    expect(rendered.getByRole('button', { name: 'Good' })).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Needs Improvement' }),
    ).toBeInTheDocument();
    expect(rendered.getByRole('button', { name: 'Other' })).toBeInTheDocument();
  });

  it('should render submit buttons for feedback', async () => {
    const rendered = await render();
    fireEvent.click(rendered.getByRole('radio', { name: 'Feedback' }));

    expect(
      rendered.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Send Feedback' }),
    ).toBeInTheDocument();
  });
});
