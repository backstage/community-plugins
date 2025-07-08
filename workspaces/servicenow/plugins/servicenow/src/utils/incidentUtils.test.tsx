/*
 * Copyright 2025 The Backstage Authors
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
import { getPriorityValue, getIncidentStateValue } from './incidentUtils';

describe('incidentUtils', () => {
  describe('getPriorityValue', () => {
    it('renders Critical priority (1)', () => {
      render(getPriorityValue(1));
      expect(screen.getByText('Critical')).toBeInTheDocument();

      const icon = screen.getByTestId('LabelImportantIcon');
      expect(icon).toHaveStyle('color: #C9190B');
      expect(icon).toHaveStyle('transform: rotate(-90deg)');
    });

    it('renders Planning priority (5)', () => {
      render(getPriorityValue(5));
      expect(screen.getByText('Planning')).toBeInTheDocument();
    });

    it('returns empty string when priority is unknown', () => {
      const result = getPriorityValue(999);
      expect(result).toBe('');
    });
  });

  describe('getIncidentStateValue', () => {
    it('renders In Progress state (2)', () => {
      render(getIncidentStateValue(2));
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders Cancelled state (8)', () => {
      render(getIncidentStateValue(8));
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('returns empty string when state is unknown', () => {
      const result = getIncidentStateValue(42);
      expect(result).toBe('');
    });
  });
});
