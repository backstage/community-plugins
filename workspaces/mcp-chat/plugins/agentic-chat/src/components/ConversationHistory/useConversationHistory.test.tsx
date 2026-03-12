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

import { renderHook, act, waitFor } from '@testing-library/react';
import { useConversationHistory } from './useConversationHistory';
import { createApiTestWrapper } from '../../test-utils/renderWithApi';
import { createTestSession } from '../../test-utils/factories';
import type { AgenticChatApi } from '../../api';

function createMockApi(
  overrides: Partial<AgenticChatApi> = {},
): Partial<AgenticChatApi> {
  return {
    listSessions: jest.fn().mockResolvedValue([]),
    listAllSessions: jest.fn().mockResolvedValue([]),
    deleteSession: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('useConversationHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('loading sessions', () => {
    it('loads sessions on mount', async () => {
      const sessions = [
        createTestSession({ id: 's1', title: 'Session 1' }),
        createTestSession({ id: 's2', title: 'Session 2' }),
      ];
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue(sessions),
      });

      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApi.listSessions).toHaveBeenCalledWith(50, 0);
      expect(result.current.sessions).toEqual(sessions);
      expect(result.current.filteredSessions).toEqual(sessions);
    });

    it('calls listAllSessions when isAdmin and showAllUsers', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
        listAllSessions: jest.fn().mockResolvedValue([]),
      });

      const { result } = renderHook(
        () => useConversationHistory({ isAdmin: true }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setShowAllUsers(true);
      });

      await waitFor(() => {
        expect(mockApi.listAllSessions).toHaveBeenCalled();
      });
    });

    it('refreshes when refreshTrigger changes', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
      });

      type Props = { refreshTrigger?: number };
      const { result, rerender } = renderHook(
        ({ refreshTrigger }: Props) =>
          useConversationHistory({ refreshTrigger }),
        {
          wrapper: createApiTestWrapper(mockApi),
          initialProps: { refreshTrigger: undefined } as Props,
        },
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = (mockApi.listSessions as jest.Mock).mock.calls
        .length;

      rerender({ refreshTrigger: 1 });

      await waitFor(() => {
        expect(
          (mockApi.listSessions as jest.Mock).mock.calls.length,
        ).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('delete flow', () => {
    it('sets confirmDeleteId on handleDeleteClick', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
      });
      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockEvent = {
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleDeleteClick('session-1', mockEvent);
      });

      expect(result.current.confirmDeleteId).toBe('session-1');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('deletes session on handleConfirmDelete', async () => {
      const sessions = [createTestSession({ id: 's1', title: 'To Delete' })];
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue(sessions),
        deleteSession: jest.fn().mockResolvedValue(true),
      });

      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.sessions).toHaveLength(1);
      });

      const mockEvent = {
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent;

      await act(async () => {
        await result.current.handleConfirmDelete('s1', mockEvent);
      });

      expect(mockApi.deleteSession).toHaveBeenCalledWith('s1');
      expect(result.current.sessions).toHaveLength(0);
      expect(result.current.deletingId).toBe(null);
    });

    it('clears confirmDeleteId on handleCancelDelete', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
      });
      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('s1', {
          stopPropagation: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(result.current.confirmDeleteId).toBe('s1');

      act(() => {
        result.current.handleCancelDelete({
          stopPropagation: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(result.current.confirmDeleteId).toBe(null);
    });
  });

  describe('search and filter', () => {
    it('filters sessions by search query', async () => {
      const sessions = [
        createTestSession({ id: 's1', title: 'Alpha Project' }),
        createTestSession({ id: 's2', title: 'Beta Release' }),
      ];
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue(sessions),
      });

      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.sessions).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchQuery('alpha');
      });

      expect(result.current.filteredSessions).toHaveLength(1);
      expect(result.current.filteredSessions[0].title).toBe('Alpha Project');
    });

    it('returns all sessions when search is empty', async () => {
      const sessions = [
        createTestSession({ title: 'A' }),
        createTestSession({ title: 'B' }),
      ];
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue(sessions),
      });

      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.sessions).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.filteredSessions).toHaveLength(2);
    });
  });

  describe('formatTime', () => {
    it('formats today as time only', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
      });
      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const today = new Date();
      const formatted = result.current.formatTime(today);
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)?/);
    });

    it('formats past dates with month and day', async () => {
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue([]),
      });
      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const pastDate = new Date('2024-06-15T14:30:00Z');
      const formatted = result.current.formatTime(pastDate);
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
    });
  });

  describe('groupedSessions', () => {
    it('groups sessions by Today, Yesterday, This week, Older', async () => {
      const now = new Date();
      const today = new Date(now);
      const yesterday = new Date(now.getTime() - 86400000);
      const sessions = [
        createTestSession({
          id: 's1',
          title: 'Today',
          updatedAt: today.toISOString(),
        }),
        createTestSession({
          id: 's2',
          title: 'Yesterday',
          updatedAt: yesterday.toISOString(),
        }),
      ];
      const mockApi = createMockApi({
        listSessions: jest.fn().mockResolvedValue(sessions),
      });

      const { result } = renderHook(() => useConversationHistory({}), {
        wrapper: createApiTestWrapper(mockApi),
      });

      await waitFor(() => {
        expect(result.current.groupedSessions.length).toBeGreaterThan(0);
      });

      const labels = result.current.groupedSessions.map(g => g.label);
      expect(labels).toContain('Today');
      expect(labels).toContain('Yesterday');
    });
  });
});
