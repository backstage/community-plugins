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
import { act, render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../dev/__data__/argoRolloutsObjects';
import { Revision, RolloutUI } from '../../../../../types/revision';
import { getRolloutUIResources } from '../../../../../utils/rollout-utils';
import Rollout from '../Rollout';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

const [canaryRollout, blueGreenRollout] = getRolloutUIResources(
  mockArgoResources,
  'quarkus-app',
);

jest.mock('../RolloutStatus', () => () => <div data-testid="rollout-status" />);
jest.mock(
  '../revisions/CanaryRevision',
  () =>
    ({
      revision,
      animateProgressBar,
    }: {
      revision: Revision;
      animateProgressBar: boolean;
    }) =>
      (
        <div
          data-testid={`canary-revision-${revision?.metadata?.name}`}
          data-animateProgressBar={!!animateProgressBar}
        />
      ),
);
jest.mock('../revisions/BlueGreenRevision', () => () => (
  <div data-testid="bluegreen-revision" />
));

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const canaryRolloutWithRevisions: RolloutUI = {
  ...canaryRollout,
  revisions: [canaryRollout.revisions[0]],
};

describe('Rollout Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const canaryRevisionTestId = `canary-revision-${
    canaryRolloutWithRevisions?.revisions?.[0]?.metadata?.name || ''
  }`;

  it('returns null if rollout prop is not provided', () => {
    const { container } = render(
      <Rollout rollout={undefined as unknown as RolloutUI} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders CanaryRevision components when canary strategy is present', () => {
    render(<Rollout rollout={canaryRolloutWithRevisions} />);

    expect(screen.getByTestId(canaryRevisionTestId)).toBeInTheDocument();
  });

  it('renders BlueGreenRevision components when blue-green strategy is present', () => {
    render(<Rollout rollout={blueGreenRollout} />);

    expect(screen.getByTestId('bluegreen-revision')).toBeInTheDocument();
  });

  it('passes isFirstRender correctly to CanaryRevision', async () => {
    const { rerender } = render(
      <Rollout rollout={canaryRolloutWithRevisions} />,
    );

    expect(screen.getByTestId(canaryRevisionTestId)).toHaveAttribute(
      'data-animateProgressBar',
      'true',
    );
    await act(async () => jest.advanceTimersByTime(100));

    rerender(<Rollout rollout={canaryRolloutWithRevisions} />);

    expect(screen.getByTestId(canaryRevisionTestId)).toHaveAttribute(
      'data-animateProgressBar',
      'false',
    );
  });
});
