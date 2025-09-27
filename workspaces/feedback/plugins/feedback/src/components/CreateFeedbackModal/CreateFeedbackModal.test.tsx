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

import { fireEvent } from '@testing-library/react';

import { FeedbackAPI, feedbackApiRef } from '../../api';
import { mockErrorList, mockExperienceList, mockEmptyList } from '../../mocks';
import { CreateFeedbackModal } from './CreateFeedbackModal';

describe('Create Feedback Modal', () => {
  const feedbackApi: Partial<FeedbackAPI> = {
    createFeedback: jest.fn(),
    getErrorList: jest.fn().mockReturnValue(mockErrorList),
    getExperienceList: jest.fn().mockReturnValue(mockExperienceList),
  };

  const PROJECT_ID = 'component:default/example-website';
  const handleModalClose = jest.fn().mockReturnValue(true);

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider apis={[[feedbackApiRef, feedbackApi]]}>
        <CreateFeedbackModal
          handleModalCloseFn={handleModalClose}
          projectEntity={PROJECT_ID}
          open
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

describe('Create Feedback Modal - Bugs Disabled', () => {
  const feedbackApi: Partial<FeedbackAPI> = {
    createFeedback: jest.fn(),
    getErrorList: jest.fn().mockReturnValue(mockEmptyList),
    getExperienceList: jest.fn().mockReturnValue(mockExperienceList),
  };

  const PROJECT_ID = 'component:default/example-website';
  const handleModalClose = jest.fn().mockReturnValue(true);

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider apis={[[feedbackApiRef, feedbackApi]]}>
        <CreateFeedbackModal
          handleModalCloseFn={handleModalClose}
          projectEntity={PROJECT_ID}
          open
        />
      </TestApiProvider>,
    );

  it('should render', async () => {
    const rendered = await render();
    expect(rendered).toBeDefined();
  });

  test('should not render type selector', async () => {
    const rendered = await render();
    const tags = rendered.queryAllByRole('radio');
    expect(rendered.queryByText(`Select type`)).not.toBeInTheDocument();
    expect(tags).toHaveLength(0);
  });

  it('should render the modal title for feedback', async () => {
    const rendered = await render();

    expect(
      rendered.getByText(`Feedback for ${PROJECT_ID.split('/').pop()}`),
    ).toBeInTheDocument();
  });

  it('should render all tags for feedback', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('button', { name: 'Excellent' }),
    ).toBeInTheDocument();
    expect(rendered.getByRole('button', { name: 'Good' })).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Needs Improvement' }),
    ).toBeInTheDocument();
    expect(rendered.getByRole('button', { name: 'Other' })).toBeInTheDocument();
  });

  it('should have correct feedback labels', async () => {
    const rendered = await render();

    expect(
      rendered.getByRole('textbox', { name: 'Summary' }),
    ).toBeInTheDocument();

    expect(
      rendered.getByRole('textbox', { name: 'Description' }),
    ).toBeInTheDocument();
  });

  it('should render submit buttons for feedback', async () => {
    const rendered = await render();

    expect(
      rendered.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Send Feedback' }),
    ).toBeInTheDocument();
  });
});

describe('Create Feedback Modal - Experiences Disabled', () => {
  const feedbackApi: Partial<FeedbackAPI> = {
    createFeedback: jest.fn(),
    getErrorList: jest.fn().mockReturnValue(mockErrorList),
    getExperienceList: jest.fn().mockReturnValue(mockEmptyList),
  };

  const PROJECT_ID = 'component:default/example-website';
  const handleModalClose = jest.fn().mockReturnValue(true);

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider apis={[[feedbackApiRef, feedbackApi]]}>
        <CreateFeedbackModal
          handleModalCloseFn={handleModalClose}
          projectEntity={PROJECT_ID}
          open
        />
      </TestApiProvider>,
    );

  it('should render', async () => {
    const rendered = await render();
    expect(rendered).toBeDefined();
  });

  test('should not render type selector', async () => {
    const rendered = await render();
    const tags = rendered.queryAllByRole('radio');
    expect(rendered.queryByText(`Select type`)).not.toBeInTheDocument();
    expect(tags).toHaveLength(0);
  });

  it('should render the modal title for bugs', async () => {
    const rendered = await render();
    expect(
      rendered.getByText(`Feedback for ${PROJECT_ID.split('/').pop()}`),
    ).toBeInTheDocument();
  });

  it('should render all tags for bug', async () => {
    const rendered = await render();
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

  it('should have correct bug labels', async () => {
    const rendered = await render();

    expect(
      rendered.getByRole('textbox', { name: 'Summary' }),
    ).toBeInTheDocument();

    expect(
      rendered.getByRole('textbox', { name: 'Description' }),
    ).toBeInTheDocument();
  });

  it('should render submit buttons for bugs', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Report Bug' }),
    ).toBeInTheDocument();
  });
});
