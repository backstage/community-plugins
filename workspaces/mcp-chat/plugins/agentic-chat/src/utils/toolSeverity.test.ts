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

import { getSeverity } from './toolSeverity';

describe('getSeverity', () => {
  describe('critical severity', () => {
    const criticalPatterns = [
      'delete',
      'remove',
      'destroy',
      'terminate',
      'drop',
    ];

    it.each(criticalPatterns)(
      'returns "critical" when tool name contains "%s"',
      pattern => {
        expect(getSeverity(`my_${pattern}_tool`)).toBe('critical');
        expect(getSeverity(`${pattern}Resource`)).toBe('critical');
        expect(getSeverity(`api.${pattern}`)).toBe('critical');
      },
    );

    it('returns "critical" for case-insensitive match', () => {
      expect(getSeverity('DELETE_USER')).toBe('critical');
      expect(getSeverity('RemoveItem')).toBe('critical');
      expect(getSeverity('DESTROY')).toBe('critical');
    });

    it('returns "critical" when critical pattern is substring', () => {
      expect(getSeverity('undelete')).toBe('critical'); // contains "delete"
      expect(getSeverity('remover')).toBe('critical'); // contains "remove"
    });
  });

  describe('warning severity', () => {
    const warningPatterns = [
      'update',
      'modify',
      'patch',
      'scale',
      'restart',
      'create',
    ];

    it.each(warningPatterns)(
      'returns "warning" when tool name contains "%s"',
      pattern => {
        expect(getSeverity(`my_${pattern}_tool`)).toBe('warning');
        expect(getSeverity(`${pattern}Resource`)).toBe('warning');
      },
    );

    it('returns "warning" for case-insensitive match', () => {
      expect(getSeverity('UPDATE_CONFIG')).toBe('warning');
      expect(getSeverity('ModifySettings')).toBe('warning');
      expect(getSeverity('CREATE_ENTITY')).toBe('warning');
    });

    it('returns "warning" when no critical pattern matches', () => {
      expect(getSeverity('updateUser')).toBe('warning');
      expect(getSeverity('scaleUp')).toBe('warning');
    });
  });

  describe('info severity', () => {
    it('returns "info" for read-only tools', () => {
      expect(getSeverity('get')).toBe('info');
      expect(getSeverity('list')).toBe('info');
      expect(getSeverity('read')).toBe('info');
      expect(getSeverity('fetch')).toBe('info');
      expect(getSeverity('query')).toBe('info');
    });

    it('returns "info" for empty tool name', () => {
      expect(getSeverity('')).toBe('info');
    });

    it('returns "info" for tool with no matching patterns', () => {
      expect(getSeverity('describe')).toBe('info');
      expect(getSeverity('inspect')).toBe('info');
      expect(getSeverity('analyze')).toBe('info');
    });
  });

  describe('priority: critical over warning', () => {
    it('returns "critical" when both critical and warning patterns match', () => {
      // "delete" is critical, "update" is warning - critical wins
      expect(getSeverity('deleteAndUpdate')).toBe('critical');
      expect(getSeverity('updateBeforeDelete')).toBe('critical');
    });
  });

  describe('edge cases', () => {
    it('handles tool names with special characters', () => {
      expect(getSeverity('delete-user-v2')).toBe('critical');
      expect(getSeverity('update.config')).toBe('warning');
    });

    it('handles very long tool names', () => {
      const longName = `${'a'.repeat(100)}delete${'b'.repeat(100)}`;
      expect(getSeverity(longName)).toBe('critical');
    });

    it('handles unicode in tool names', () => {
      expect(getSeverity('café_update')).toBe('warning');
      expect(getSeverity('日本語_delete')).toBe('critical');
    });
  });
});
