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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TokenUsageBadge } from './TokenUsageBadge';
import type { ResponseUsage } from '@backstage-community/plugin-agentic-chat-common';

const theme = createTheme();

function renderBadge(usage: ResponseUsage) {
  return render(
    <ThemeProvider theme={theme}>
      <TokenUsageBadge usage={usage} />
    </ThemeProvider>,
  );
}

describe('TokenUsageBadge', () => {
  const baseUsage: ResponseUsage = {
    input_tokens: 2341,
    output_tokens: 847,
    total_tokens: 3188,
  };

  // ---------------------------------------------------------------------------
  // Default (collapsed) view
  // ---------------------------------------------------------------------------
  describe('collapsed view', () => {
    it('displays formatted input and output tokens', () => {
      renderBadge(baseUsage);
      expect(screen.getByText('2,341 in')).toBeInTheDocument();
      expect(screen.getByText('847 out')).toBeInTheDocument();
    });

    it('formats large numbers with locale separators', () => {
      renderBadge({
        input_tokens: 71021,
        output_tokens: 350,
        total_tokens: 71437,
      });
      expect(screen.getByText('71,021 in')).toBeInTheDocument();
      expect(screen.getByText('350 out')).toBeInTheDocument();
    });

    it('handles zero tokens', () => {
      renderBadge({ input_tokens: 0, output_tokens: 0, total_tokens: 0 });
      expect(screen.getByText('0 in')).toBeInTheDocument();
      expect(screen.getByText('0 out')).toBeInTheDocument();
    });

    it('does not show total, cached, or reasoning when collapsed', () => {
      renderBadge({
        ...baseUsage,
        input_tokens_details: { cached_tokens: 500 },
        output_tokens_details: { reasoning_tokens: 128 },
      });
      expect(screen.queryByText(/total/)).not.toBeInTheDocument();
      expect(screen.queryByText(/cached/)).not.toBeInTheDocument();
      expect(screen.queryByText(/reasoning/)).not.toBeInTheDocument();
    });

    it('renders an icon', () => {
      const { container } = renderBadge(baseUsage);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Expanded view
  // ---------------------------------------------------------------------------
  describe('expanded view', () => {
    it('shows total tokens after click', () => {
      renderBadge(baseUsage);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('3,188 total')).toBeInTheDocument();
    });

    it('shows cached tokens when present', () => {
      renderBadge({
        input_tokens: 71021,
        output_tokens: 350,
        total_tokens: 71437,
        input_tokens_details: { cached_tokens: 2978 },
      });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('71,437 total')).toBeInTheDocument();
      expect(screen.getByText('2,978 cached')).toBeInTheDocument();
    });

    it('shows reasoning tokens when present', () => {
      renderBadge({
        input_tokens: 10,
        output_tokens: 148,
        total_tokens: 158,
        output_tokens_details: { reasoning_tokens: 128 },
      });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('128 reasoning')).toBeInTheDocument();
    });

    it('omits cached when zero', () => {
      renderBadge({
        ...baseUsage,
        input_tokens_details: { cached_tokens: 0 },
      });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByText(/cached/)).not.toBeInTheDocument();
    });

    it('omits cached when details absent', () => {
      renderBadge(baseUsage);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByText(/cached/)).not.toBeInTheDocument();
    });

    it('handles output_tokens_details being null (Llama Stack)', () => {
      renderBadge({ ...baseUsage, output_tokens_details: null });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('3,188 total')).toBeInTheDocument();
      expect(screen.queryByText(/reasoning/)).not.toBeInTheDocument();
    });

    it('collapses on second click', async () => {
      renderBadge(baseUsage);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('3,188 total')).toBeInTheDocument();
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/total/)).not.toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has an accessible label with full breakdown', () => {
      renderBadge(baseUsage);
      expect(
        screen.getByLabelText(
          'Token usage: 2,341 input, 847 output, 3,188 total',
        ),
      ).toBeInTheDocument();
    });

    it('has role=button and aria-expanded', () => {
      renderBadge(baseUsage);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('responds to keyboard activation (Enter)', () => {
      renderBadge(baseUsage);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('responds to keyboard activation (Space)', () => {
      renderBadge(baseUsage);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // ---------------------------------------------------------------------------
  // Data integrity — values pass through unmodified
  // ---------------------------------------------------------------------------
  describe('data integrity', () => {
    it('displays server-reported values without any client-side math', () => {
      renderBadge({
        input_tokens: 57326,
        output_tokens: 174,
        total_tokens: 57568,
      });
      expect(screen.getByText('57,326 in')).toBeInTheDocument();
      expect(screen.getByText('174 out')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('57,568 total')).toBeInTheDocument();
    });
  });
});
