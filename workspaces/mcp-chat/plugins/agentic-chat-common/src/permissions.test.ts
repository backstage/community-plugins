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

import {
  agenticChatAccessPermission,
  agenticChatAdminPermission,
  agenticChatPermissions,
} from './permissions';

describe('permissions', () => {
  describe('agenticChatAccessPermission', () => {
    it('has the correct name', () => {
      expect(agenticChatAccessPermission.name).toBe('agenticChat.access');
    });

    it('has read action attribute', () => {
      expect(agenticChatAccessPermission.attributes).toEqual({
        action: 'read',
      });
    });
  });

  describe('agenticChatAdminPermission', () => {
    it('has the correct name', () => {
      expect(agenticChatAdminPermission.name).toBe('agenticChat.admin');
    });

    it('has update action attribute', () => {
      expect(agenticChatAdminPermission.attributes).toEqual({
        action: 'update',
      });
    });
  });

  describe('agenticChatPermissions', () => {
    it('exports both permissions in the array', () => {
      expect(agenticChatPermissions).toHaveLength(2);
      expect(agenticChatPermissions).toContain(agenticChatAccessPermission);
      expect(agenticChatPermissions).toContain(agenticChatAdminPermission);
    });
  });
});
