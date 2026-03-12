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
import { ConversationHistory } from './ConversationHistory';
import {
  createApiTestWrapper,
  createAdminMockApi,
  createTestSession,
} from '../../test-utils';

const theme = createTheme();

function createApiWithSessions(
  overrides: {
    listSessions?: jest.Mock;
    listAllSessions?: jest.Mock;
    deleteSession?: jest.Mock;
  } = {},
) {
  const api = createAdminMockApi();
  return {
    ...api,
    listSessions: overrides.listSessions ?? jest.fn().mockResolvedValue([]),
    listAllSessions:
      overrides.listAllSessions ?? jest.fn().mockResolvedValue([]),
    deleteSession: overrides.deleteSession ?? jest.fn().mockResolvedValue(true),
  };
}

function createWrapper(api: ReturnType<typeof createApiWithSessions>) {
  const Wrapper = createApiTestWrapper(api);
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      <Wrapper>{children}</Wrapper>
    </ThemeProvider>
  );
}

describe('ConversationHistory', () => {
  const defaultProps = {
    onSelectSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons initially', () => {
    const api = createApiWithSessions({
      listSessions: jest
        .fn()
        .mockImplementation(() => new Promise<never>(() => {})),
    });
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('renders "No conversations yet" empty state', async () => {
    const api = createApiWithSessions();
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Start chatting to create history'),
    ).toBeInTheDocument();
  });

  it('renders sessions grouped by date', async () => {
    const now = new Date();
    const today = new Date(now);
    const yesterday = new Date(now.getTime() - 86400000);
    const weekAgo = new Date(now.getTime() - 3 * 86400000);
    const older = new Date(now.getTime() - 10 * 86400000);

    const sessions = [
      createTestSession({
        id: 'today-1',
        title: 'Today Session',
        updatedAt: today.toISOString(),
      }),
      createTestSession({
        id: 'yesterday-1',
        title: 'Yesterday Session',
        updatedAt: yesterday.toISOString(),
      }),
      createTestSession({
        id: 'week-1',
        title: 'This Week Session',
        updatedAt: weekAgo.toISOString(),
      }),
      createTestSession({
        id: 'older-1',
        title: 'Older Session',
        updatedAt: older.toISOString(),
      }),
    ];

    const api = createApiWithSessions({
      listSessions: jest.fn().mockResolvedValue(sessions),
    });
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByText('Today Session')).toBeInTheDocument();
    });

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('This week')).toBeInTheDocument();
    expect(screen.getByText('Older')).toBeInTheDocument();
    expect(screen.getByText('Yesterday Session')).toBeInTheDocument();
    expect(screen.getByText('This Week Session')).toBeInTheDocument();
    expect(screen.getByText('Older Session')).toBeInTheDocument();
  });

  it('search filtering works', async () => {
    const sessions = [
      createTestSession({ id: 's1', title: 'Alpha Session' }),
      createTestSession({ id: 's2', title: 'Beta Session' }),
      createTestSession({ id: 's3', title: 'Gamma Session' }),
    ];

    const api = createApiWithSessions({
      listSessions: jest.fn().mockResolvedValue(sessions),
    });
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha Session')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search conversations...');
    fireEvent.change(searchInput, { target: { value: 'Beta' } });

    await waitFor(() => {
      expect(screen.getByText('Beta Session')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Session')).not.toBeInTheDocument();
      expect(screen.queryByText('Gamma Session')).not.toBeInTheDocument();
    });
  });

  it('refresh button calls loadSessions', async () => {
    const sessions = [createTestSession({ id: 's1', title: 'Session 1' })];

    const api = createApiWithSessions({
      listSessions: jest.fn().mockResolvedValue(sessions),
    });
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText('Refresh conversation history');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(api.listSessions).toHaveBeenCalledTimes(2);
    });
  });

  it('delete flow: click delete -> confirm -> session removed', async () => {
    jest.useFakeTimers();

    const sessions = [
      createTestSession({ id: 'delete-me', title: 'To Delete' }),
    ];

    const api = createApiWithSessions({
      listSessions: jest.fn().mockResolvedValue(sessions),
      deleteSession: jest.fn().mockResolvedValue(true),
    });
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
    });

    render(<ConversationHistory {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete conversation');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteSession).toHaveBeenCalledWith('delete-me');
    });

    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
