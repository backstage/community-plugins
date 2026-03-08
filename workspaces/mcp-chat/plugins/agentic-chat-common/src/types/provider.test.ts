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
  GLOBAL_CONFIG_KEYS,
  PROVIDER_SCOPED_KEYS,
  scopedConfigKey,
  isProviderScopedKey,
  isGlobalConfigKey,
} from './provider';

describe('provider config key utilities', () => {
  describe('GLOBAL_CONFIG_KEYS', () => {
    it('contains expected global keys', () => {
      expect(GLOBAL_CONFIG_KEYS).toContain('systemPrompt');
      expect(GLOBAL_CONFIG_KEYS).toContain('branding');
      expect(GLOBAL_CONFIG_KEYS).toContain('swimLanes');
      expect(GLOBAL_CONFIG_KEYS).toContain('safetyPatterns');
      expect(GLOBAL_CONFIG_KEYS).toContain('mcpServers');
      expect(GLOBAL_CONFIG_KEYS).toContain('disabledMcpServerIds');
      expect(GLOBAL_CONFIG_KEYS).toContain('mcpProxyUrl');
    });

    it('does not contain provider-scoped keys', () => {
      for (const key of PROVIDER_SCOPED_KEYS) {
        expect(GLOBAL_CONFIG_KEYS).not.toContain(key);
      }
    });

    it('does not overlap with PROVIDER_SCOPED_KEYS', () => {
      const globalSet = new Set<string>(GLOBAL_CONFIG_KEYS);
      const scopedSet = new Set<string>(PROVIDER_SCOPED_KEYS);
      const intersection = [...globalSet].filter(k => scopedSet.has(k));
      expect(intersection).toEqual([]);
    });
  });

  describe('PROVIDER_SCOPED_KEYS', () => {
    it('contains expected provider-scoped keys', () => {
      expect(PROVIDER_SCOPED_KEYS).toContain('model');
      expect(PROVIDER_SCOPED_KEYS).toContain('baseUrl');
      expect(PROVIDER_SCOPED_KEYS).toContain('toolChoice');
      expect(PROVIDER_SCOPED_KEYS).toContain('vectorStoreConfig');
      expect(PROVIDER_SCOPED_KEYS).toContain('activeVectorStoreIds');
      expect(PROVIDER_SCOPED_KEYS).toContain('safetyEnabled');
      expect(PROVIDER_SCOPED_KEYS).toContain('evaluationEnabled');
    });
  });

  describe('scopedConfigKey', () => {
    it('creates a scoped key with provider prefix', () => {
      expect(scopedConfigKey('llamastack', 'model')).toBe('llamastack::model');
    });

    it('works with googleadk provider', () => {
      expect(scopedConfigKey('googleadk', 'baseUrl')).toBe(
        'googleadk::baseUrl',
      );
    });

    it('handles arbitrary key strings', () => {
      expect(scopedConfigKey('llamastack', 'customKey')).toBe(
        'llamastack::customKey',
      );
    });
  });

  describe('isProviderScopedKey', () => {
    it('returns true for provider-scoped keys', () => {
      expect(isProviderScopedKey('model')).toBe(true);
      expect(isProviderScopedKey('baseUrl')).toBe(true);
      expect(isProviderScopedKey('toolChoice')).toBe(true);
      expect(isProviderScopedKey('vectorStoreConfig')).toBe(true);
      expect(isProviderScopedKey('safetyEnabled')).toBe(true);
      expect(isProviderScopedKey('evaluationEnabled')).toBe(true);
    });

    it('returns false for global keys', () => {
      expect(isProviderScopedKey('systemPrompt')).toBe(false);
      expect(isProviderScopedKey('branding')).toBe(false);
      expect(isProviderScopedKey('swimLanes')).toBe(false);
      expect(isProviderScopedKey('mcpServers')).toBe(false);
    });

    it('returns false for unknown keys', () => {
      expect(isProviderScopedKey('unknownKey')).toBe(false);
      expect(isProviderScopedKey('')).toBe(false);
      expect(isProviderScopedKey('activeProvider')).toBe(false);
    });
  });

  describe('isGlobalConfigKey', () => {
    it('returns true for global keys', () => {
      expect(isGlobalConfigKey('systemPrompt')).toBe(true);
      expect(isGlobalConfigKey('branding')).toBe(true);
      expect(isGlobalConfigKey('swimLanes')).toBe(true);
      expect(isGlobalConfigKey('safetyPatterns')).toBe(true);
      expect(isGlobalConfigKey('mcpServers')).toBe(true);
      expect(isGlobalConfigKey('disabledMcpServerIds')).toBe(true);
      expect(isGlobalConfigKey('mcpProxyUrl')).toBe(true);
    });

    it('returns false for provider-scoped keys', () => {
      expect(isGlobalConfigKey('model')).toBe(false);
      expect(isGlobalConfigKey('baseUrl')).toBe(false);
      expect(isGlobalConfigKey('vectorStoreConfig')).toBe(false);
    });

    it('returns false for unknown keys', () => {
      expect(isGlobalConfigKey('unknownKey')).toBe(false);
      expect(isGlobalConfigKey('')).toBe(false);
      expect(isGlobalConfigKey('activeProvider')).toBe(false);
    });
  });
});
