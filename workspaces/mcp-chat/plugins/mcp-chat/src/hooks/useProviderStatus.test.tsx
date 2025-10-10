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
import { ReactNode, FC } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { mcpChatApiRef } from '../api';
import { useProviderStatus } from './useProviderStatus';
import { ProviderStatusData } from '../types';

describe('useProviderStatus', () => {
  const mockProviderStatusData: ProviderStatusData = {
    providers: [
      {
        id: 'openai',
        model: 'gpt-4o-mini',
        baseUrl: 'https://api.openai.com',
        connection: {
          connected: true,
          models: ['gpt-4o-mini', 'gpt-4o'],
        },
      },
      {
        id: 'anthropic',
        model: 'claude-3-sonnet',
        baseUrl: 'https://api.anthropic.com',
        connection: {
          connected: true,
          models: ['claude-3-sonnet', 'claude-3-haiku'],
        },
      },
    ],
    summary: {
      totalProviders: 2,
      healthyProviders: 2,
    },
    timestamp: '2025-01-01T00:00:00Z',
  };

  const mockMcpChatApi = {
    getProviderStatus: jest.fn(),
  };

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return provider status data when API call succeeds', async () => {
      mockMcpChatApi.getProviderStatus.mockResolvedValue(
        mockProviderStatusData,
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.providerStatusData).toEqual(mockProviderStatusData);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty provider data', async () => {
      const emptyData: ProviderStatusData = {
        providers: [],
        summary: {
          totalProviders: 0,
          healthyProviders: 0,
        },
        timestamp: '2025-01-01T00:00:00Z',
      };
      mockMcpChatApi.getProviderStatus.mockResolvedValue(emptyData);
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.providerStatusData).toEqual(emptyData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch provider status';
      mockMcpChatApi.getProviderStatus.mockRejectedValue(
        new Error(errorMessage),
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.providerStatusData).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockMcpChatApi.getProviderStatus.mockRejectedValue(networkError);
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.providerStatusData).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockMcpChatApi.getProviderStatus.mockRejectedValue('String error');
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.providerStatusData).toBeNull();
      // When a non-Error is thrown, useAsyncRetry doesn't have a .message property
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading states', () => {
    it('should show loading state initially', () => {
      mockMcpChatApi.getProviderStatus.mockImplementation(
        () => new Promise(() => {}),
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.providerStatusData).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      mockMcpChatApi.getProviderStatus.mockResolvedValue(
        mockProviderStatusData,
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const updatedData = {
        ...mockProviderStatusData,
        summary: { ...mockProviderStatusData.summary, totalProviders: 3 },
      };
      mockMcpChatApi.getProviderStatus.mockResolvedValue(updatedData);

      await waitFor(() => {
        result.current.refetch();
      });

      await waitFor(() =>
        expect(result.current.providerStatusData).toEqual(updatedData),
      );
      expect(mockMcpChatApi.getProviderStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during refetch', async () => {
      mockMcpChatApi.getProviderStatus.mockResolvedValue(
        mockProviderStatusData,
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const errorMessage = 'Refetch failed';
      mockMcpChatApi.getProviderStatus.mockRejectedValue(
        new Error(errorMessage),
      );

      await waitFor(() => {
        result.current.refetch();
      });

      await waitFor(() => expect(result.current.error).toBe(errorMessage));
      expect(result.current.providerStatusData).toBeNull();
    });
  });

  describe('Return value structure', () => {
    it('should return correct interface structure', async () => {
      mockMcpChatApi.getProviderStatus.mockResolvedValue(
        mockProviderStatusData,
      );
      const { result } = renderHook(() => useProviderStatus(), {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current).toHaveProperty('providerStatusData');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
