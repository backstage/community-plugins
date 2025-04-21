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

import { RolloutPhase, RolloutPhaseType } from '../../../../../types/rollouts';
import RolloutStatus from '../RolloutStatus';

describe('RolloutStatus Component', () => {
  test('renders null when status is not provided', () => {
    const { container } = render(
      <RolloutStatus status={null as unknown as RolloutPhaseType} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders the Chip component with the correct status', () => {
    render(<RolloutStatus status={RolloutPhase.Progressing} />);

    const chipElement = screen.getByTestId('rollout-status-chip');
    expect(chipElement).toBeInTheDocument();
    expect(chipElement).toHaveTextContent(RolloutPhase.Progressing);
  });

  test('renders the RolloutStatusIcon with the correct status', () => {
    render(<RolloutStatus status={RolloutPhase.Healthy} />);

    const iconElement = screen.queryByTestId('rollout-healthy-icon');
    expect(iconElement).toBeInTheDocument();
  });
});
