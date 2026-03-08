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
  PROVIDER_REGISTRY,
  getProviderDescriptor,
  getAllProviderDescriptors,
  isValidProviderType,
} from './registry';

describe('provider registry', () => {
  it('PROVIDER_REGISTRY contains both llamastack and googleadk entries', () => {
    expect(PROVIDER_REGISTRY.has('llamastack')).toBe(true);
    expect(PROVIDER_REGISTRY.has('googleadk')).toBe(true);
  });

  it('getProviderDescriptor("llamastack") returns descriptor with implemented: true', () => {
    const d = getProviderDescriptor('llamastack');
    expect(d).toBeDefined();
    expect(d!.id).toBe('llamastack');
    expect(d!.implemented).toBe(true);
  });

  it('getProviderDescriptor("googleadk") returns descriptor with implemented: false', () => {
    const d = getProviderDescriptor('googleadk');
    expect(d).toBeDefined();
    expect(d!.id).toBe('googleadk');
    expect(d!.implemented).toBe(false);
  });

  it('getProviderDescriptor("unknown") returns undefined', () => {
    expect(
      getProviderDescriptor(
        'unknown' as import('@backstage-community/plugin-agentic-chat-common').ProviderType,
      ),
    ).toBeUndefined();
  });

  it('getAllProviderDescriptors returns all providers sorted by displayName', () => {
    const all = getAllProviderDescriptors();
    expect(all).toHaveLength(2);
    expect(all[0].displayName).toBe('Google ADK');
    expect(all[1].displayName).toBe('Llama Stack');
  });

  it('isValidProviderType("llamastack") returns true', () => {
    expect(isValidProviderType('llamastack')).toBe(true);
  });

  it('isValidProviderType("unknown") returns false', () => {
    expect(isValidProviderType('unknown')).toBe(false);
  });

  it('LlamaStack descriptor has all capabilities set to true', () => {
    const d = getProviderDescriptor('llamastack')!;
    expect(d.capabilities).toEqual({
      chat: true,
      rag: true,
      safety: true,
      evaluation: true,
      conversations: true,
      mcpTools: true,
    });
  });

  it('GoogleADK descriptor has chat, conversations, mcpTools true and others false', () => {
    const d = getProviderDescriptor('googleadk')!;
    expect(d.capabilities.chat).toBe(true);
    expect(d.capabilities.conversations).toBe(true);
    expect(d.capabilities.mcpTools).toBe(true);
    expect(d.capabilities.rag).toBe(false);
    expect(d.capabilities.safety).toBe(false);
    expect(d.capabilities.evaluation).toBe(false);
  });

  it('LlamaStack has configFields with at least model and baseUrl', () => {
    const d = getProviderDescriptor('llamastack')!;
    const keys = d.configFields.map(f => f.key);
    expect(keys).toContain('model');
    expect(keys).toContain('baseUrl');
  });
});
