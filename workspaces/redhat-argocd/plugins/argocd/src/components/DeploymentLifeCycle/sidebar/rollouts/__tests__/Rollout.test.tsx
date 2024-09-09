import React from 'react';

import { act, render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../dev/__data__/argoRolloutsObjects';
import { Revision, RolloutUI } from '../../../../../types/revision';
import { getRolloutUIResources } from '../../../../../utils/rollout-utils';
import Rollout from '../Rollout';

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
