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
import { render, screen, fireEvent } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToolCallCard, ToolCallCardProps } from './ToolCallCard';
import { ToolCall } from '../../types';

const theme = createTheme();

const toolCall: ToolCall = {
  id: 'call_1',
  type: 'function',
  function: {
    name: 'search_web',
    arguments: JSON.stringify({ query: 'cats' }),
  },
};

const defaults: ToolCallCardProps = {
  toolCall,
  approvalStatus: 'pending',
  serverName: 'brave-search',
  onApprove: jest.fn(),
  onReject: jest.fn(),
};

const renderCard = (overrides: Partial<ToolCallCardProps> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <ToolCallCard {...defaults} {...overrides} />
    </ThemeProvider>,
  );

describe('ToolCallCard', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('status labels', () => {
    it('shows pending label', () => {
      renderCard({ approvalStatus: 'pending' });
      expect(
        screen.getByText('Awaiting approval for MCP tool'),
      ).toBeInTheDocument();
    });

    it('shows approved label', () => {
      renderCard({ approvalStatus: 'approved' });
      expect(screen.getByText('Called MCP tool')).toBeInTheDocument();
    });

    it('shows rejected label', () => {
      renderCard({ approvalStatus: 'rejected' });
      expect(screen.getByText('Rejected MCP tool')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('shows server name and tool name', () => {
      renderCard();
      expect(screen.getByText('brave-search / search_web')).toBeInTheDocument();
    });

    it('shows approve/reject buttons when pending', () => {
      renderCard({ approvalStatus: 'pending' });
      expect(screen.getByLabelText('Approve tool call')).toBeInTheDocument();
      expect(screen.getByLabelText('Reject tool call')).toBeInTheDocument();
    });

    it('hides approve/reject buttons when not pending', () => {
      renderCard({ approvalStatus: 'approved' });
      expect(
        screen.queryByLabelText('Approve tool call'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Reject tool call'),
      ).not.toBeInTheDocument();
    });
  });

  describe('approve/reject actions', () => {
    it('calls onApprove with tool call id', () => {
      const onApprove = jest.fn();
      renderCard({ onApprove });
      fireEvent.click(screen.getByLabelText('Approve tool call'));
      expect(onApprove).toHaveBeenCalledWith('call_1');
    });

    it('calls onReject with tool call id', () => {
      const onReject = jest.fn();
      renderCard({ onReject });
      fireEvent.click(screen.getByLabelText('Reject tool call'));
      expect(onReject).toHaveBeenCalledWith('call_1');
    });
  });

  describe('expand/collapse', () => {
    it('starts expanded when pending', () => {
      renderCard({ approvalStatus: 'pending' });
      expect(screen.getByText('Parameters')).toBeVisible();
    });

    it('starts collapsed when approved', () => {
      renderCard({ approvalStatus: 'approved' });
      expect(screen.queryByText('Parameters')).not.toBeVisible();
    });

    it('toggles on header click', () => {
      renderCard({ approvalStatus: 'approved' });
      expect(screen.queryByText('Parameters')).not.toBeVisible();

      fireEvent.click(screen.getByText('Called MCP tool'));
      expect(screen.getByText('Parameters')).toBeVisible();
    });
  });

  describe('body content', () => {
    it('shows formatted arguments', () => {
      renderCard({ approvalStatus: 'pending' });
      expect(screen.getByText(/\"query\": \"cats\"/)).toBeInTheDocument();
    });

    it('shows raw string for invalid JSON arguments', () => {
      const badToolCall = {
        ...toolCall,
        function: { name: 'search_web', arguments: 'not-json' },
      };
      renderCard({ toolCall: badToolCall, approvalStatus: 'pending' });
      expect(screen.getByText('not-json')).toBeInTheDocument();
    });

    it('shows tool result when approved and result exists', () => {
      renderCard({ approvalStatus: 'approved', toolResult: 'found 3 cats' });
      fireEvent.click(screen.getByText('Called MCP tool'));
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(screen.getByText('found 3 cats')).toBeInTheDocument();
    });

    it('hides tool result when not approved', () => {
      renderCard({ approvalStatus: 'rejected', toolResult: 'found 3 cats' });
      fireEvent.click(screen.getByText('Rejected MCP tool'));
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });

    it('hides tool result when no result provided', () => {
      renderCard({ approvalStatus: 'approved' });
      fireEvent.click(screen.getByText('Called MCP tool'));
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });
  });
});
