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

import { render, screen } from '@testing-library/react';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

describe('WorkflowStatusBadge', () => {
  it('renders the status label as visible text', () => {
    render(<WorkflowStatusBadge status="Succeeded" />);

    expect(screen.getByText('Succeeded')).toBeInTheDocument();
  });

  it('renders an icon alongside the label', () => {
    render(<WorkflowStatusBadge status="Running" />);

    const badge = screen.getByTestId('workflow-status-badge-running');
    expect(badge.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders exactly one visible status label, not a duplicate', () => {
    render(<WorkflowStatusBadge status="Failed" />);

    const badge = screen.getByTestId('workflow-status-badge-failed');
    // Guards against regressing to double-rendering the label — see
    // WorkflowStatusIcon, which already renders the status as text.
    expect(badge.textContent).toBe('Failed');
  });

  it.each([
    ['Pending'],
    ['Running'],
    ['Succeeded'],
    ['Failed'],
    ['Error'],
  ] as const)('renders the %s status with a matching test id', status => {
    render(<WorkflowStatusBadge status={status} />);

    expect(
      screen.getByTestId(`workflow-status-badge-${status.toLowerCase()}`),
    ).toBeInTheDocument();
  });
});
