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
import { screen, render } from '@testing-library/react';
import { mockArgoResources } from '../../../../../../../dev/__data__/argoRolloutsObjects';
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import { getRolloutUIResources } from '../../../../../../utils/rollout-utils';
import { useArgoResources } from '../../../rollouts/RolloutContext';
import RolloutMetadata from '../RolloutMetadata';
import { mockUseTranslation } from '../../../../../../test-utils/mockTranslations';

jest.mock('../../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('../../../rollouts/RolloutContext', () => ({
  ...jest.requireActual('../../../rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));

const rolloutResource: Resource = {
  version: 'argoproj.io',
  kind: 'Rollout',
  namespace: 'openshift-gitops',
  name: 'canary-rollout-analysis',
  status: 'Synced',
  health: {
    status: 'Degraded',
  },
};

describe('RolloutMetadata component', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({
      rollouts: getRolloutUIResources(mockArgoResources, 'quarkus-app'),
    });
  });

  it('should not render metadata when rollout is missing', () => {
    const { container } = render(
      <RolloutMetadata resource={undefined as unknown as Resource} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render metadata when rollout is found', () => {
    render(<RolloutMetadata resource={rolloutResource} />);

    expect(screen.getByText('openshift-gitops')).toBeInTheDocument();
    expect(screen.getByText('Canary')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });
});
