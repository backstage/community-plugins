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
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepCardSkeleton } from './StepCardSkeleton';

describe('StepCardSkeleton', () => {
  it('is labelled as loading, shows the progress and can be closed', async () => {
    const onDismiss = jest.fn();
    const { unmount } = await renderInTestApp(
      <StepCardSkeleton progress={0.4} onDismiss={onDismiss} />,
    );
    const card = screen.getAllByLabelText('Looking for the next step…')[0];
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Close tour' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    // content loading has no deadline: indeterminate
    unmount();
    await renderInTestApp(<StepCardSkeleton onDismiss={onDismiss} />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute(
      'aria-valuenow',
    );
  });
});
