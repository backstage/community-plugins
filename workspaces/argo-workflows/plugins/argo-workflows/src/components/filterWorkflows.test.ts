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

import { filterWorkflows } from './utils';
import { makeWorkflowItem } from './testUtils';

const workflows = [
  makeWorkflowItem({ name: 'deploy-frontend', phase: 'Succeeded' }),
  makeWorkflowItem({ name: 'deploy-backend', phase: 'Failed' }),
  makeWorkflowItem({ name: 'build-images', phase: 'Running' }),
  makeWorkflowItem({ name: 'lint-check', phase: 'Succeeded' }),
  makeWorkflowItem({ name: 'integration-tests', phase: 'Error' }),
  makeWorkflowItem({ name: 'pending-deploy', phase: 'Pending' }),
];

describe('filterWorkflows', () => {
  describe('no filters applied', () => {
    it('returns all workflows when status set is empty and search is empty', () => {
      const result = filterWorkflows(workflows, new Set(), '');
      expect(result).toHaveLength(6);
    });

    it('returns all workflows when search is only whitespace', () => {
      const result = filterWorkflows(workflows, new Set(), '   ');
      expect(result).toHaveLength(6);
    });
  });

  describe('status filtering', () => {
    it('filters to a single status', () => {
      const result = filterWorkflows(workflows, new Set(['Succeeded']), '');
      expect(result).toHaveLength(2);
      expect(result.every(wf => wf.status.phase === 'Succeeded')).toBe(true);
    });

    it('filters to multiple statuses', () => {
      const result = filterWorkflows(
        workflows,
        new Set(['Failed', 'Error']),
        '',
      );
      expect(result).toHaveLength(2);
      const phases = result.map(wf => wf.status.phase);
      expect(phases).toContain('Failed');
      expect(phases).toContain('Error');
    });

    it('returns empty array when no workflows match the status', () => {
      const result = filterWorkflows(workflows, new Set(['NonExistent']), '');
      expect(result).toHaveLength(0);
    });

    it('returns all workflows when all statuses are selected', () => {
      const result = filterWorkflows(
        workflows,
        new Set(['Succeeded', 'Failed', 'Running', 'Error', 'Pending']),
        '',
      );
      expect(result).toHaveLength(6);
    });
  });

  describe('search filtering', () => {
    it('filters by exact name substring (case-insensitive)', () => {
      const result = filterWorkflows(workflows, new Set(), 'deploy');
      expect(result).toHaveLength(3);
      expect(result.map(wf => wf.metadata.name)).toEqual(
        expect.arrayContaining([
          'deploy-frontend',
          'deploy-backend',
          'pending-deploy',
        ]),
      );
    });

    it('matches regardless of case', () => {
      const result = filterWorkflows(workflows, new Set(), 'DEPLOY');
      expect(result).toHaveLength(3);
    });

    it('trims whitespace from search query', () => {
      const result = filterWorkflows(workflows, new Set(), '  lint  ');
      expect(result).toHaveLength(1);
      expect(result[0].metadata.name).toBe('lint-check');
    });

    it('returns empty array when no workflows match the search', () => {
      const result = filterWorkflows(workflows, new Set(), 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('combined status and search filters', () => {
    it('applies both status and search filters together', () => {
      const result = filterWorkflows(
        workflows,
        new Set(['Succeeded']),
        'deploy',
      );
      expect(result).toHaveLength(1);
      expect(result[0].metadata.name).toBe('deploy-frontend');
      expect(result[0].status.phase).toBe('Succeeded');
    });

    it('returns empty when status matches but search does not', () => {
      const result = filterWorkflows(workflows, new Set(['Running']), 'deploy');
      expect(result).toHaveLength(0);
    });

    it('returns empty when search matches but status does not', () => {
      const result = filterWorkflows(workflows, new Set(['Pending']), 'lint');
      expect(result).toHaveLength(0);
    });
  });

  describe('empty input', () => {
    it('returns empty array when workflows list is empty', () => {
      const result = filterWorkflows([], new Set(['Succeeded']), 'deploy');
      expect(result).toHaveLength(0);
    });

    it('returns empty array when workflows list is empty and no filters', () => {
      const result = filterWorkflows([], new Set(), '');
      expect(result).toHaveLength(0);
    });
  });

  describe('does not mutate input', () => {
    it('does not modify the original workflows array', () => {
      const original = [...workflows];
      filterWorkflows(workflows, new Set(['Succeeded']), 'deploy');
      expect(workflows).toHaveLength(original.length);
      expect(workflows.map(wf => wf.metadata.name)).toEqual(
        original.map(wf => wf.metadata.name),
      );
    });
  });
});
