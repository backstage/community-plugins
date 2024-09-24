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
import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../../dev/__data__/argoRolloutsObjects';
import { ReplicaSet } from '../../../../../../types/resources';
import RevisionImage from '../RevisionImage';

describe('RevisionImage', () => {
  it('renders the image name when it is present in the revision', () => {
    const mockRevision: ReplicaSet = mockArgoResources.replicasets[0];

    render(<RevisionImage revision={mockRevision} />);

    expect(
      screen.getByText('Traffic to image argoproj/rollouts-demo:yellow'),
    ).toBeInTheDocument();
  });

  it('renders nothing when the image is not present in the revision', () => {
    const mockRevision: ReplicaSet = mockArgoResources.replicasets[0];

    const mockRevisionWithoutImage: ReplicaSet = {
      ...mockRevision,
      spec: {
        ...mockRevision.spec,
        template: {
          spec: {
            containers: [],
          },
        },
      } as any,
    };

    const { container } = render(
      <RevisionImage revision={mockRevisionWithoutImage} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
