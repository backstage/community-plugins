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
import { render } from '@testing-library/react';

import { ReplicaSet } from '../../../../../../types/resources';
import RevisionStatus from '../RevisionStatus';

jest.mock('@patternfly/react-icons', () => ({
  ArrowCircleDownIcon: () => <div data-testid="ArrowCircleDownIcon" />,
  CircleNotchIcon: () => <div data-testid="CircleNotchIcon" />,
  CheckCircleIcon: () => <div data-testid="CheckCircleIcon" />,
}));

describe('RevisionStatus', () => {
  it('renders ArrowCircleDownIcon revision is not passed', () => {
    const mockRevision: ReplicaSet = null as unknown as ReplicaSet;
    const { container } = render(<RevisionStatus revision={mockRevision} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ArrowCircleDownIcon when replicas are 0', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 0,
        availableReplicas: 0,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('ArrowCircleDownIcon')).toBeInTheDocument();
  });

  it('renders CircleNotchIcon when availableReplicas are less than replicas', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 3,
        availableReplicas: 1,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('CircleNotchIcon')).toBeInTheDocument();
  });

  it('renders CheckCircleIcon when availableReplicas equal replicas', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 3,
        availableReplicas: 3,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });
});
