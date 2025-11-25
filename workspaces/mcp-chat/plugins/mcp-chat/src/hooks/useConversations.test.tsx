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

import { renderHook, waitFor, act } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { identityApiRef } from '@backstage/core-plugin-api';
import { useConversations } from './useConversations';
import { mcpChatApiRef } from '../api';
import { ConversationRecord } from '../types';

describe('useConversations', () => {
  const mockConversations: ConversationRecord[] = [
    {
      id: 'conv-1',
      userId: 'user-1',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'conv-2',
      userId: 'user-1',
      messages: [
        { role: 'user', content: 'How are you?' },
        { role: 'assistant', content: 'I am doing well!' },
      ],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  ];

  const mockMcpChatApi = {
    getConversations: jest.fn(),
    getConversationById: jest.fn(),
  };

  const mockIdentityApi = {
    getBackstageIdentity: jest.fn().mockResolvedValue({
      userEntityRef: 'user:default/testuser',
      ownershipEntityRefs: [],
    }),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [mcpChatApiRef, mockMcpChatApi],
        [identityApiRef, mockIdentityApi],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return conversations', async () => {
    mockMcpChatApi.getConversations.mockResolvedValue({
      conversations: mockConversations,
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.conversations).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual(mockConversations);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle 500 errors gracefully', async () => {
    mockMcpChatApi.getConversations.mockRejectedValue(
      new Error('500 Internal Server Error'),
    );

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle other errors gracefully', async () => {
    mockMcpChatApi.getConversations.mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All errors are handled gracefully by returning empty array
    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should cache conversations to prevent flickering during refetch', async () => {
    // Initial data
    mockMcpChatApi.getConversations.mockResolvedValueOnce({
      conversations: mockConversations,
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual(mockConversations);

    // Setup new data for refetch
    const newConversation: ConversationRecord = {
      id: 'conv-3',
      userId: 'user-1',
      messages: [
        { role: 'user', content: 'New message' },
        { role: 'assistant', content: 'New response' },
      ],
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    };

    mockMcpChatApi.getConversations.mockResolvedValueOnce({
      conversations: [...mockConversations, newConversation],
    });

    // Trigger refetch
    act(() => {
      result.current.refreshConversations();
    });

    // During refetch, should still show cached conversations (no flicker)
    expect(result.current.conversations).toEqual(mockConversations);

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(3);
    });

    expect(result.current.conversations).toEqual([
      ...mockConversations,
      newConversation,
    ]);
  });

  it('should load conversation by id', async () => {
    mockMcpChatApi.getConversations.mockResolvedValue({
      conversations: mockConversations,
    });
    mockMcpChatApi.getConversationById.mockResolvedValue(mockConversations[0]);

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const conversation = await result.current.loadConversation('conv-1');

    expect(mockMcpChatApi.getConversationById).toHaveBeenCalledWith('conv-1');
    expect(conversation).toEqual(mockConversations[0]);
  });

  it('should refresh conversations when refreshConversations is called', async () => {
    mockMcpChatApi.getConversations.mockResolvedValue({
      conversations: mockConversations,
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockMcpChatApi.getConversations).toHaveBeenCalledTimes(1);

    // Trigger refresh
    act(() => {
      result.current.refreshConversations();
    });

    await waitFor(() => {
      expect(mockMcpChatApi.getConversations).toHaveBeenCalledTimes(2);
    });
  });

  it('should maintain cached data across multiple refetches', async () => {
    // First load
    mockMcpChatApi.getConversations.mockResolvedValueOnce({
      conversations: [mockConversations[0]],
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(1);
    });

    // Second refetch
    mockMcpChatApi.getConversations.mockResolvedValueOnce({
      conversations: mockConversations,
    });

    act(() => {
      result.current.refreshConversations();
    });

    // Should show cached data during refetch
    expect(result.current.conversations).toHaveLength(1);

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(2);
    });

    // Third refetch
    mockMcpChatApi.getConversations.mockResolvedValueOnce({
      conversations: [...mockConversations, mockConversations[0]],
    });

    act(() => {
      result.current.refreshConversations();
    });

    // Should show previous cached data (2 items)
    expect(result.current.conversations).toHaveLength(2);

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(3);
    });
  });

  it('should return empty array when no conversations and no cache', async () => {
    mockMcpChatApi.getConversations.mockResolvedValue({
      conversations: [],
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
  });

  it('should skip API call for guest users', async () => {
    // Mock guest user
    mockIdentityApi.getBackstageIdentity.mockResolvedValueOnce({
      userEntityRef: 'user:development/guest',
      ownershipEntityRefs: [],
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return empty array without calling API
    expect(result.current.conversations).toEqual([]);
    expect(mockMcpChatApi.getConversations).not.toHaveBeenCalled();
  });

  it('should not load conversation for guest users', async () => {
    // Mock guest user
    mockIdentityApi.getBackstageIdentity.mockResolvedValue({
      userEntityRef: 'user:development/guest',
      ownershipEntityRefs: [],
    });

    mockMcpChatApi.getConversations.mockResolvedValue({
      conversations: [],
    });

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Attempt to load conversation should throw error
    await expect(result.current.loadConversation('conv-1')).rejects.toThrow(
      'Guest users cannot load conversations',
    );

    expect(mockMcpChatApi.getConversationById).not.toHaveBeenCalled();
  });
});
