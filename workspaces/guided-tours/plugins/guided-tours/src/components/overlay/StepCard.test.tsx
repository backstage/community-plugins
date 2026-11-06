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
import { errorApiRef } from '@backstage/frontend-plugin-api';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepCard } from './StepCard';

const Throwing = () => {
  throw new Error('boom');
};

describe('StepCard', () => {
  const handlers = () => ({
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onDismiss: jest.fn(),
  });

  it('shows the first step with a disabled Previous button', async () => {
    const h = handlers();
    await renderInTestApp(
      <StepCard
        tourTitle="Welcome"
        step={{ id: 's1', content: 'Hello **there**' }}
        stepIndex={0}
        stepCount={3}
        {...h}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    expect(screen.getByText('there').tagName).toBe('STRONG');
    expect(screen.getByText('Step 1 of 3')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(
      screen.queryByText('Click the highlighted element to continue.'),
    ).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close tour' }));
    expect(h.onNext).toHaveBeenCalledTimes(1);
    expect(h.onDismiss).toHaveBeenCalledTimes(1);
    expect(h.onPrevious).not.toHaveBeenCalled();
  });

  it('shows Done on the last step and the hint on click-through steps', async () => {
    const h = handlers();
    await renderInTestApp(
      <StepCard
        tourTitle="Welcome"
        step={{
          id: 's3',
          title: 'Last one',
          content: 'Bye',
          advanceOn: 'click',
        }}
        stepIndex={2}
        stepCount={3}
        {...h}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Last one' })).toBeVisible();
    expect(screen.getByText('Step 3 of 3')).toBeVisible();
    expect(
      screen.getByText('Click the highlighted element to continue.'),
    ).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(h.onPrevious).toHaveBeenCalledTimes(1);
    expect(h.onNext).toHaveBeenCalledTimes(1);
  });

  it('renders a resolved element instead of markdown', async () => {
    await renderInTestApp(
      <StepCard
        tourTitle="Tour"
        step={{
          id: 'a',
          content: { loader: async () => <div>unused: resolved below</div> },
        }}
        element={<div data-testid="lazy">from a chunk</div>}
        stepIndex={1}
        stepCount={2}
        {...handlers()}
      />,
    );
    expect(await screen.findByTestId('lazy')).toHaveTextContent('from a chunk');
    expect(screen.queryByText('unused: resolved below')).toBeNull();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('shows an error instead of content that throws, and keeps the buttons', async () => {
    const errorApi = mockApis.error.mock();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderInTestApp(
      <TestApiProvider apis={[[errorApiRef, errorApi]]}>
        <StepCard
          tourTitle="Tour"
          step={{ id: 'a', content: { loader: async () => <Throwing /> } }}
          element={<Throwing />}
          stepIndex={0}
          stepCount={2}
          {...handlers()}
        />
      </TestApiProvider>,
    );
    expect(
      screen.getByText('This step could not be shown.'),
    ).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(errorApi.post).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom' }),
    );
  });

  it('shows the loader error', async () => {
    await renderInTestApp(
      <StepCard
        tourTitle="Tour"
        step={{ id: 'a', content: { loader: async () => <div /> } }}
        error={new Error('chunk failed')}
        stepIndex={0}
        stepCount={1}
        {...handlers()}
      />,
    );
    expect(
      screen.getByText('This step could not be shown.'),
    ).toBeInTheDocument();
    expect(screen.getByText('chunk failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });
});
