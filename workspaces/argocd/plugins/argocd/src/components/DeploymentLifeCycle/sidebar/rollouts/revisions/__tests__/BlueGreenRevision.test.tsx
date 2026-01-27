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
import BlueGreenRevision from '../BlueGreenRevision';
import { mockUseTranslation } from '../../../../../../test-utils/mockTranslations';

jest.mock('../../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const blueGreenRollout = getRolloutUIResources(
  mockArgoResources,
  'quarkus-app',
)[1];

const revision = blueGreenRollout.revisions[0];

describe('BlueGreenRevision', () => {
  it('should not render if the revision is missing', () => {
    const { container } = render(
      <BlueGreenRevision revision={null as unknown as Revision} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render the bluegreen revision', () => {
    render(<BlueGreenRevision revision={revision} />);

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
  });

  it('should render the stable bluegreen revision', () => {
    const blueGreenRevision: Revision = {
      ...revision,
      rollout: {
        ...revision.rollout,
        status: {
          ...revision.rollout?.status,
          phase: 'Paused',
          currentPodHash: revision.metadata?.name,
          stableRS: revision.metadata?.name,
        },
      },
    };
    render(<BlueGreenRevision revision={blueGreenRevision} />);

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('should render the active revision', () => {
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
    render(<BlueGreenRevision revision={stableRevision} />);

    expect(
      screen.getByTestId(revision?.metadata?.name as string),
    ).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
