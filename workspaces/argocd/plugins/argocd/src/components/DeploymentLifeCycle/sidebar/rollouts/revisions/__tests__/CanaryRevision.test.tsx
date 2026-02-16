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
import { render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../../dev/__data__/argoRolloutsObjects';
import { Revision } from '../../../../../../types/revision';
import { getRolloutUIResources } from '../../../../../../utils/rollout-utils';
import CanaryRevision from '../CanaryRevision';
import { mockUseTranslation } from '../../../../../../test-utils/mockTranslations';

jest.mock('../../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));
const mockRollout = getRolloutUIResources(mockArgoResources, 'quarkus-app')[0];

const revision = mockRollout.revisions[0];

describe('CanaryRevision', () => {
  it('should not render if the revision is missing', () => {
    const { container } = render(
      <CanaryRevision
        animateProgressBar={undefined as any}
        revision={null as unknown as Revision}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render the canaryRevision', () => {
    render(<CanaryRevision animateProgressBar revision={revision} />);

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
  });

  it('should render the paused canary revision', () => {
    const canaryRevision: Revision = {
      ...revision,
      rollout: {
        ...revision.rollout,
        status: {
          ...revision.rollout?.status,
          phase: 'Paused',
          currentPodHash: revision.metadata?.name,
          stableRS: 'stable-revision',
        },
      },
    };
    render(
      <CanaryRevision animateProgressBar={false} revision={canaryRevision} />,
    );

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
  });

  it('should render the stable canary revision', () => {
    const stableRevision: Revision = {
      ...revision,
      rollout: {
        ...revision.rollout,
        status: {
          ...revision.rollout?.status,
          currentPodHash: revision.metadata?.name,
        },
      },
    };
    render(
      <CanaryRevision animateProgressBar={false} revision={stableRevision} />,
    );

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
  });
});
