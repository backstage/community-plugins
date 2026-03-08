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

import { buildEffectiveSwimLanes } from './buildEffectiveSwimLanes';
import type { SwimLane, Workflow, QuickAction } from '../../types';

describe('buildEffectiveSwimLanes', () => {
  const fallbackColor = '#1e40af';

  describe('config-driven swim lanes', () => {
    it('returns config lanes when they have cards', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Getting Started',
          cards: [{ title: 'Hello', prompt: 'Say hello' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('lane-1');
      expect(result[0].cards).toHaveLength(1);
    });

    it('applies fallback color when config lane has no color', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Test',
          cards: [{ title: 'Card', prompt: 'Prompt' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result[0].color).toBe(fallbackColor);
    });

    it('preserves config color when provided', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'lane-1',
          title: 'Test',
          color: '#ff0000',
          cards: [{ title: 'Card', prompt: 'Prompt' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result[0].color).toBe('#ff0000');
    });

    it('filters out config lanes with empty cards', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'empty',
          title: 'Empty',
          cards: [],
        },
        {
          id: 'full',
          title: 'Full',
          cards: [{ title: 'Card', prompt: 'Prompt' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('full');
    });

    it('sorts config lanes by order', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'c',
          title: 'C',
          order: 3,
          cards: [{ title: 'Card', prompt: 'P' }],
        },
        {
          id: 'a',
          title: 'A',
          order: 1,
          cards: [{ title: 'Card', prompt: 'P' }],
        },
        {
          id: 'b',
          title: 'B',
          order: 2,
          cards: [{ title: 'Card', prompt: 'P' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result.map(l => l.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('fallback: category grouping', () => {
    it('groups workflows by category', () => {
      const workflows: Workflow[] = [
        {
          id: 'wf-1',
          name: 'Migration',
          description: 'Migrate apps',
          category: 'DevOps',
          steps: [{ title: 'Step 1', prompt: 'Analyze' }],
        },
        {
          id: 'wf-2',
          name: 'Deploy',
          description: 'Deploy apps',
          category: 'DevOps',
          steps: [{ title: 'Step 1', prompt: 'Deploy' }],
        },
      ];

      const result = buildEffectiveSwimLanes({
        workflows,
        quickActions: [],
        fallbackColor,
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('DevOps');
      expect(result[0].cards).toHaveLength(2);
    });

    it('groups quick actions by category', () => {
      const quickActions: QuickAction[] = [
        { title: 'Help', prompt: 'Help me', category: 'Support' },
        { title: 'FAQ', prompt: 'FAQ', category: 'Support' },
      ];

      const result = buildEffectiveSwimLanes({
        workflows: [],
        quickActions,
        fallbackColor,
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Support');
      expect(result[0].cards).toHaveLength(2);
    });

    it('defaults to "General" category when none specified', () => {
      const quickActions: QuickAction[] = [
        { title: 'Help', prompt: 'Help me' },
      ];

      const result = buildEffectiveSwimLanes({
        workflows: [],
        quickActions,
        fallbackColor,
      });

      expect(result[0].title).toBe('General');
      expect(result[0].id).toBe('general');
    });

    it('mixes workflows and quick actions in same category', () => {
      const workflows: Workflow[] = [
        {
          id: 'wf-1',
          name: 'WF',
          description: 'Workflow',
          category: 'Dev',
          steps: [{ title: 'S', prompt: 'P' }],
        },
      ];
      const quickActions: QuickAction[] = [
        { title: 'QA', prompt: 'P', category: 'Dev' },
      ];

      const result = buildEffectiveSwimLanes({
        workflows,
        quickActions,
        fallbackColor,
      });

      expect(result).toHaveLength(1);
      expect(result[0].cards).toHaveLength(2);
    });

    it('returns empty array when no data', () => {
      const result = buildEffectiveSwimLanes({
        workflows: [],
        quickActions: [],
        fallbackColor,
      });

      expect(result).toEqual([]);
    });

    it('uses first workflow step prompt for card prompt', () => {
      const workflows: Workflow[] = [
        {
          id: 'wf-1',
          name: 'WF',
          description: 'Desc',
          steps: [
            { title: 'Step 1', prompt: 'First step prompt' },
            { title: 'Step 2', prompt: 'Second' },
          ],
        },
      ];

      const result = buildEffectiveSwimLanes({
        workflows,
        quickActions: [],
        fallbackColor,
      });

      expect(result[0].cards[0].prompt).toBe('First step prompt');
    });

    it('handles workflow with no steps gracefully', () => {
      const workflows: Workflow[] = [
        {
          id: 'wf-1',
          name: 'Empty WF',
          description: 'No steps',
          steps: [],
        },
      ];

      const result = buildEffectiveSwimLanes({
        workflows,
        quickActions: [],
        fallbackColor,
      });

      expect(result[0].cards[0].prompt).toBe('');
    });

    it('applies config lane styling to fallback categories', () => {
      const configSwimLanes: SwimLane[] = [
        {
          id: 'dev',
          title: 'Dev',
          icon: 'code',
          color: '#ff0000',
          order: 1,
          cards: [],
        },
      ];
      const quickActions: QuickAction[] = [
        { title: 'Help', prompt: 'P', category: 'Dev' },
      ];

      const result = buildEffectiveSwimLanes({
        configSwimLanes,
        workflows: [],
        quickActions,
        fallbackColor,
      });

      expect(result[0].color).toBe('#ff0000');
      expect(result[0].icon).toBe('code');
      expect(result[0].order).toBe(1);
    });
  });
});
