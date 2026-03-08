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

import { ConfigReader, type JsonObject } from '@backstage/config';
import { ConfigLoader, ConfigValidationError } from './ConfigLoader';
import { createMockLogger } from '../../test-utils';

function createConfigLoader(yamlConfig: JsonObject) {
  const config = new ConfigReader(yamlConfig);
  const logger = createMockLogger();
  return { loader: new ConfigLoader(config, logger), logger };
}

describe('ConfigLoader', () => {
  describe('validateRequiredConfig', () => {
    it('passes when baseUrl and model are provided', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            baseUrl: 'http://localhost:8321',
            model: 'test-model',
          },
        },
      });
      expect(() => loader.validateRequiredConfig()).not.toThrow();
    });

    it('throws ConfigValidationError when llamaStack section is missing', () => {
      const { loader } = createConfigLoader({ agenticChat: {} });
      expect(() => loader.validateRequiredConfig()).toThrow(
        ConfigValidationError,
      );
    });

    it('throws when baseUrl is missing', () => {
      const { loader } = createConfigLoader({
        agenticChat: { llamaStack: { model: 'test-model' } },
      });
      expect(() => loader.validateRequiredConfig()).toThrow(
        ConfigValidationError,
      );
    });

    it('throws when model is missing', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: { baseUrl: 'http://localhost:8321' },
        },
      });
      expect(() => loader.validateRequiredConfig()).toThrow(
        ConfigValidationError,
      );
    });
  });

  describe('loadLlamaStackConfig', () => {
    const minimalConfig = {
      agenticChat: {
        llamaStack: {
          baseUrl: 'http://localhost:8321',
          model: 'test-model',
        },
      },
    };

    it('loads minimal config with defaults', () => {
      const { loader } = createConfigLoader(minimalConfig);
      const result = loader.loadLlamaStackConfig();

      expect(result.baseUrl).toBe('http://localhost:8321');
      expect(result.model).toBe('test-model');
      expect(result.vectorStoreIds).toEqual([]);
      expect(result.vectorStoreName).toBe('agentic-chat-knowledge-base');
      expect(result.embeddingModel).toBe(
        'sentence-transformers/all-MiniLM-L6-v2',
      );
      expect(result.embeddingDimension).toBe(384);
      expect(result.chunkingStrategy).toBe('auto');
      expect(result.maxChunkSizeTokens).toBe(512);
      expect(result.chunkOverlapTokens).toBe(50);
      expect(result.skipTlsVerify).toBe(false);
      expect(result.verboseStreamLogging).toBe(false);
      expect(result.zdrMode).toBe(false);
      expect(result.enableWebSearch).toBe(false);
      expect(result.enableCodeInterpreter).toBe(false);
    });

    it('loads vectorStoreIds array', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            vectorStoreIds: ['vs-1', 'vs-2'],
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.vectorStoreIds).toEqual(['vs-1', 'vs-2']);
    });

    it('falls back to single vectorStoreId for backward compat', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            vectorStoreId: 'legacy-vs',
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.vectorStoreIds).toEqual(['legacy-vs']);
    });

    it('loads token when provided', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            token: 'secret-token',
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.token).toBe('secret-token');
    });

    it('parses toolChoice as string', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            toolChoice: 'required',
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.toolChoice).toBe('required');
    });

    it('parses toolChoice as function object', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            toolChoice: { type: 'function', name: 'my_func' },
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.toolChoice).toEqual({ type: 'function', name: 'my_func' });
    });

    it('parses reasoning config with effort and summary', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            reasoning: { effort: 'high', summary: 'concise' },
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.reasoning).toEqual({
        effort: 'high',
        summary: 'concise',
      });
    });

    it('parses reasoning config as shorthand string', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            reasoning: 'medium',
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.reasoning).toEqual({ effort: 'medium' });
    });

    it('ignores invalid reasoning string', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            reasoning: 'invalid',
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.reasoning).toBeUndefined();
    });

    it('loads hybrid search config', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          llamaStack: {
            ...minimalConfig.agenticChat.llamaStack,
            searchMode: 'hybrid',
            bm25Weight: 0.3,
            semanticWeight: 0.7,
          },
        },
      });
      const result = loader.loadLlamaStackConfig();
      expect(result.searchMode).toBe('hybrid');
      expect(result.bm25Weight).toBe(0.3);
      expect(result.semanticWeight).toBe(0.7);
    });
  });

  describe('loadSecurityConfig', () => {
    it('defaults to plugin-only mode', () => {
      const { loader } = createConfigLoader({});
      const result = loader.loadSecurityConfig();
      expect(result.mode).toBe('plugin-only');
    });

    it('loads full mode with mcpOAuth', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          security: {
            mode: 'full',
            mcpOAuth: {
              tokenUrl: 'https://auth.example.com/token',
              clientId: 'client-1',
              clientSecret: 'secret-1',
              scopes: ['openid', 'mcp'],
            },
          },
        },
      });
      const result = loader.loadSecurityConfig();
      expect(result.mode).toBe('full');
      expect(result.mcpOAuth).toBeDefined();
      expect(result.mcpOAuth!.tokenUrl).toBe('https://auth.example.com/token');
      expect(result.mcpOAuth!.scopes).toEqual(['openid', 'mcp']);
    });

    it('falls back to plugin-only when full mode lacks mcpOAuth', () => {
      const { loader, logger } = createConfigLoader({
        agenticChat: { security: { mode: 'full' } },
      });
      const result = loader.loadSecurityConfig();
      expect(result.mode).toBe('plugin-only');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Falling back'),
      );
    });

    it('loads none mode', () => {
      const { loader } = createConfigLoader({
        agenticChat: { security: { mode: 'none' } },
      });
      const result = loader.loadSecurityConfig();
      expect(result.mode).toBe('none');
    });
  });

  describe('loadDocumentsConfig', () => {
    it('returns null when no documents section', () => {
      const { loader } = createConfigLoader({});
      expect(loader.loadDocumentsConfig()).toBeNull();
    });

    it('returns null when sources is empty', () => {
      const { loader } = createConfigLoader({
        agenticChat: { documents: { sources: [] } },
      });
      expect(loader.loadDocumentsConfig()).toBeNull();
    });

    it('loads directory source', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          documents: {
            sources: [
              {
                type: 'directory',
                path: '/docs',
                patterns: ['**/*.md'],
              },
            ],
          },
        },
      });
      const result = loader.loadDocumentsConfig();
      expect(result).not.toBeNull();
      expect(result!.sources[0]).toEqual({
        type: 'directory',
        path: '/docs',
        patterns: ['**/*.md'],
      });
    });

    it('loads url source', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          documents: {
            sources: [
              {
                type: 'url',
                urls: ['https://example.com/doc.md'],
              },
            ],
          },
        },
      });
      const result = loader.loadDocumentsConfig();
      expect(result!.sources[0]).toEqual({
        type: 'url',
        urls: ['https://example.com/doc.md'],
        headers: undefined,
      });
    });

    it('loads github source', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          documents: {
            sources: [
              {
                type: 'github',
                repo: 'org/repo',
                branch: 'main',
                path: 'docs/',
              },
            ],
          },
        },
      });
      const result = loader.loadDocumentsConfig();
      expect(result!.sources[0]).toEqual({
        type: 'github',
        repo: 'org/repo',
        branch: 'main',
        path: 'docs/',
        patterns: undefined,
        token: undefined,
      });
    });

    it('defaults syncMode to append', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          documents: {
            sources: [{ type: 'directory', path: '/docs' }],
          },
        },
      });
      const result = loader.loadDocumentsConfig();
      expect(result!.syncMode).toBe('append');
    });
  });

  describe('loadSystemPrompt', () => {
    it('returns configured prompt', () => {
      const { loader } = createConfigLoader({
        agenticChat: { systemPrompt: 'You are a helpful assistant' },
      });
      expect(loader.loadSystemPrompt()).toBe('You are a helpful assistant');
    });

    it('returns empty string and warns when not configured', () => {
      const { loader, logger } = createConfigLoader({});
      expect(loader.loadSystemPrompt()).toBe('');
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('loadProxyBaseUrl', () => {
    it('uses explicit proxyBaseUrl', () => {
      const { loader } = createConfigLoader({
        agenticChat: { proxyBaseUrl: 'https://my-proxy.example.com/api' },
      });
      expect(loader.loadProxyBaseUrl()).toBe(
        'https://my-proxy.example.com/api',
      );
    });

    it('strips trailing slash from explicit URL', () => {
      const { loader } = createConfigLoader({
        agenticChat: { proxyBaseUrl: 'https://my-proxy.example.com/api/' },
      });
      expect(loader.loadProxyBaseUrl()).toBe(
        'https://my-proxy.example.com/api',
      );
    });

    it('falls back to backend.baseUrl', () => {
      const { loader } = createConfigLoader({
        backend: { baseUrl: 'https://backstage.example.com' },
      });
      expect(loader.loadProxyBaseUrl()).toBe(
        'https://backstage.example.com/api/agentic-chat',
      );
    });

    it('defaults to localhost when nothing configured', () => {
      const { loader } = createConfigLoader({});
      expect(loader.loadProxyBaseUrl()).toBe(
        'http://localhost:7007/api/agentic-chat',
      );
    });
  });

  describe('loadWorkflows', () => {
    it('returns empty array when no workflows configured', () => {
      const { loader } = createConfigLoader({});
      expect(loader.loadWorkflows()).toEqual([]);
    });

    it('parses workflow with steps', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          workflows: [
            {
              id: 'wf-1',
              name: 'Migration',
              description: 'Migrate an app',
              steps: [
                { title: 'Step 1', prompt: 'Analyze the app' },
                { title: 'Step 2', prompt: 'Create a plan' },
              ],
            },
          ],
        },
      });
      const result = loader.loadWorkflows();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('wf-1');
      expect(result[0].steps).toHaveLength(2);
    });
  });

  describe('loadSwimLanes', () => {
    it('returns empty array when no swim lanes configured', () => {
      const { loader } = createConfigLoader({});
      expect(loader.loadSwimLanes()).toEqual([]);
    });

    it('parses swim lanes with cards', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          swimLanes: [
            {
              id: 'lane-1',
              title: 'Getting Started',
              cards: [{ title: 'Hello', prompt: 'Say hello' }],
            },
          ],
        },
      });
      const result = loader.loadSwimLanes();
      expect(result).toHaveLength(1);
      expect(result[0].cards).toHaveLength(1);
    });

    it('sorts swim lanes by order', () => {
      const { loader } = createConfigLoader({
        agenticChat: {
          swimLanes: [
            { id: 'b', title: 'B', order: 2, cards: [] },
            { id: 'a', title: 'A', order: 1, cards: [] },
            { id: 'c', title: 'C', order: 3, cards: [] },
          ],
        },
      });
      const result = loader.loadSwimLanes();
      expect(result.map(l => l.id)).toEqual(['a', 'b', 'c']);
    });
  });
});
