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
import { useSwimLanesEditor } from './useSwimLanesEditor';
import { createApiTestWrapper, createAdminMockApi } from '../../test-utils';
import type { SwimLane } from '../../types';

describe('useSwimLanesEditor', () => {
  const createWrapper = (api: ReturnType<typeof createAdminMockApi>) => {
    return createApiTestWrapper(api);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty lanes when no config', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: null,
        source: 'default',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      expect(result.current.lanes).toEqual([]);
      expect(result.current.dirty).toBe(false);
    });

    it('loads lanes from config entry when available', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Test Lane',
          cards: [{ title: 'Card 1', prompt: 'Prompt 1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      expect(result.current.lanes).toHaveLength(1);
      expect(result.current.lanes[0].title).toBe('Test Lane');
      expect(result.current.lanes[0].cards).toHaveLength(1);
      expect(result.current.lanes[0].cards[0].title).toBe('Card 1');
      expect(result.current.lanes[0].cards[0].prompt).toBe('Prompt 1');
    });
  });

  describe('addLane', () => {
    it('creates a new lane', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: null,
        source: 'default',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      act(() => {
        result.current.addLane();
      });

      expect(result.current.lanes).toHaveLength(1);
      expect(result.current.lanes[0].title).toBe('');
      expect(result.current.lanes[0].cards).toHaveLength(1);
      expect(result.current.lanes[0].cards[0].title).toBe('');
      expect(result.current.lanes[0].cards[0].prompt).toBe('');
    });
  });

  describe('removeLane', () => {
    it('removes a lane', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane 1',
          cards: [],
          order: 1,
        },
        {
          id: 'lane-2',
          title: 'Lane 2',
          cards: [],
          order: 2,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;

      act(() => {
        result.current.removeLane(laneKey);
      });

      expect(result.current.lanes).toHaveLength(1);
      expect(result.current.lanes[0].title).toBe('Lane 2');
    });
  });

  describe('updateLane', () => {
    it('updates lane properties', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Original',
          cards: [],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;

      act(() => {
        result.current.updateLane(laneKey, {
          title: 'Updated Title',
          description: 'Updated Description',
        });
      });

      expect(result.current.lanes[0].title).toBe('Updated Title');
      expect(result.current.lanes[0].description).toBe('Updated Description');
    });
  });

  describe('addCard / removeCard / updateCard', () => {
    it('addCard adds a card to a lane', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: 'P1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;

      act(() => {
        result.current.addCard(laneKey);
      });

      expect(result.current.lanes[0].cards).toHaveLength(2);
      expect(result.current.lanes[0].cards[1].title).toBe('');
      expect(result.current.lanes[0].cards[1].prompt).toBe('');
    });

    it('removeCard removes a card from a lane', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [
            { title: 'Card 1', prompt: 'P1' },
            { title: 'Card 2', prompt: 'P2' },
          ],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;
      const cardKey = result.current.lanes[0].cards[1]._key;

      act(() => {
        result.current.removeCard(laneKey, cardKey);
      });

      expect(result.current.lanes[0].cards).toHaveLength(1);
      expect(result.current.lanes[0].cards[0].title).toBe('Card 1');
    });

    it('updateCard updates card properties', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: 'P1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;
      const cardKey = result.current.lanes[0].cards[0]._key;

      act(() => {
        result.current.updateCard(laneKey, cardKey, {
          title: 'Updated Card',
          prompt: 'Updated Prompt',
        });
      });

      expect(result.current.lanes[0].cards[0].title).toBe('Updated Card');
      expect(result.current.lanes[0].cards[0].prompt).toBe('Updated Prompt');
    });
  });

  describe('validation', () => {
    it('handleSave with empty lane title shows toast', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: null,
        source: 'default',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      act(() => {
        result.current.addLane();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.toast).toBe(
        'Please fix validation errors before saving',
      );
      expect(result.current.validationErrors.lanes.size).toBeGreaterThan(0);
    });

    it('handleSave with card missing prompt shows toast', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: '' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.toast).toBe(
        'Please fix validation errors before saving',
      );
      expect(result.current.validationErrors.cards.size).toBeGreaterThan(0);
    });

    it('handleSave with no lanes shows toast', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: null,
        source: 'default',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      act(() => {
        result.current.addLane();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.toast).toBe(
        'Please fix validation errors before saving',
      );
    });
  });

  describe('handleSave success', () => {
    it('saves valid lanes and shows success toast', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: 'Prompt 1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);
      (api.setAdminConfig as jest.Mock).mockResolvedValue({
        warnings: undefined,
      });

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.toast).toBe('Swim lanes saved successfully');
      expect(api.setAdminConfig).toHaveBeenCalledWith(
        'swimLanes',
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Lane',
            cards: expect.arrayContaining([
              expect.objectContaining({ title: 'Card 1', prompt: 'Prompt 1' }),
            ]),
          }),
        ]),
      );
    });
  });

  describe('dirty tracking', () => {
    it('is clean when no changes made', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: 'P1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      expect(result.current.dirty).toBe(false);
    });

    it('is dirty after modifying a lane', async () => {
      const lanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Lane',
          cards: [{ title: 'Card 1', prompt: 'P1' }],
          order: 1,
        },
      ];

      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: {
          configKey: 'swimLanes',
          configValue: lanes,
          updatedAt: '2025-01-01T00:00:00Z',
          updatedBy: 'user:default/admin',
        },
        source: 'database',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      const laneKey = result.current.lanes[0]._key;

      act(() => {
        result.current.updateLane(laneKey, { title: 'Modified' });
      });

      expect(result.current.dirty).toBe(true);
    });
  });

  describe('dismissToast', () => {
    it('clears toast', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockResolvedValue({
        entry: null,
        source: 'default',
      });
      (api.getSwimLanes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwimLanesEditor(), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      act(() => {
        result.current.addLane();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.toast).not.toBeNull();

      act(() => {
        result.current.dismissToast();
      });

      expect(result.current.toast).toBeNull();
    });
  });
});
