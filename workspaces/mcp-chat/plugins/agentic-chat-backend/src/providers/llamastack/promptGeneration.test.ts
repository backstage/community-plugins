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
import type { EffectiveConfig } from '../../types';
import {
  buildMetaPrompt,
  extractToolContext,
  PROMPT_ENGINEER_INSTRUCTIONS,
  type PromptCapabilities,
} from './promptGeneration';

function makeConfig(overrides: Partial<EffectiveConfig> = {}): EffectiveConfig {
  return {
    model: 'test-model',
    baseUrl: 'http://localhost:8321',
    systemPrompt: '',
    enableWebSearch: false,
    enableCodeInterpreter: false,
    vectorStoreIds: [],
    vectorStoreName: 'vs',
    embeddingModel: 'em',
    embeddingDimension: 384,
    chunkingStrategy: 'auto',
    maxChunkSizeTokens: 512,
    chunkOverlapTokens: 50,
    skipTlsVerify: false,
    zdrMode: false,
    verboseStreamLogging: false,
    ...overrides,
  };
}

describe('promptGeneration', () => {
  describe('extractToolContext', () => {
    it('lists model and disabled tools by default', () => {
      const ctx = extractToolContext(makeConfig());
      expect(ctx).toContain('Model: test-model');
      expect(ctx).toContain('Web Search: disabled');
      expect(ctx).toContain('Code Interpreter: disabled');
      expect(ctx).toContain('MCP Servers: none configured');
      expect(ctx).toContain('not configured');
      expect(ctx).toContain('Safety Shields: disabled');
    });

    it('reflects enabled capabilities', () => {
      const ctx = extractToolContext(
        makeConfig({
          enableWebSearch: true,
          enableCodeInterpreter: true,
          mcpServers: [
            { id: 's1', name: 'GitHub', type: 'sse', url: 'http://gh' },
            {
              id: 's2',
              name: 'Jira',
              type: 'streamable-http',
              url: 'http://j',
            },
          ],
          vectorStoreIds: ['vs1', 'vs2'],
          safetyEnabled: true,
          inputShields: ['content-safety'],
          outputShields: [],
          evaluationEnabled: true,
        }),
      );

      expect(ctx).toContain('Web Search: enabled');
      expect(ctx).toContain('Code Interpreter: enabled');
      expect(ctx).toContain('GitHub, Jira');
      expect(ctx).toContain('2 active vector store(s)');
      expect(ctx).toContain('Safety Shields: enabled (content-safety)');
      expect(ctx).toContain('Response Evaluation: enabled');
    });
  });

  describe('buildMetaPrompt', () => {
    it('returns { instructions, input } with separated concerns', () => {
      const result = buildMetaPrompt(
        'Help with Kubernetes',
        makeConfig({ model: 'llama-3' }),
      );

      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('input');
      expect(result.instructions).toBe(PROMPT_ENGINEER_INSTRUCTIONS);
      expect(result.input).toContain('Help with Kubernetes');
      expect(result.input).toContain('Model: llama-3');
      expect(result.input).toContain('Generate the system prompt now');
    });

    it('keeps prompt engineer role in instructions, not in input', () => {
      const result = buildMetaPrompt('Help with Kubernetes', makeConfig());

      expect(result.instructions).toContain('expert AI prompt engineer');
      expect(result.input).not.toContain('expert AI prompt engineer');
    });

    it('keeps user description in input, not in instructions', () => {
      const result = buildMetaPrompt('Help with Kubernetes', makeConfig());

      expect(result.input).toContain('Help with Kubernetes');
      expect(result.instructions).not.toContain('Help with Kubernetes');
    });

    it('includes requirement guidelines in instructions', () => {
      const result = buildMetaPrompt('Do stuff', makeConfig());
      expect(result.instructions).toContain('clear, concise role definition');
      expect(result.instructions).toContain('150 and 500 words');
      expect(result.instructions).toContain('no meta-commentary');
    });

    it('uses basic extractToolContext when no capabilities provided', () => {
      const result = buildMetaPrompt('Help with K8s', makeConfig());
      expect(result.input).toContain('Web Search: disabled');
      expect(result.input).not.toContain('CONNECTED TOOLS');
    });

    it('uses detailed capabilities section when capabilities are provided', () => {
      const caps: PromptCapabilities = {
        enableWebSearch: true,
        enableCodeInterpreter: false,
        tools: [
          {
            name: 'get_pod_logs',
            description: 'Retrieve logs from a Kubernetes pod',
            serverLabel: 'k8s-mcp',
          },
          {
            name: 'list_deployments',
            description: 'List all deployments',
            serverLabel: 'k8s-mcp',
          },
          {
            name: 'create_ticket',
            description: 'Create a JIRA ticket',
            serverLabel: 'jira-mcp',
          },
        ],
        ragEnabled: true,
        vectorStoreNames: ['docs-store'],
        safetyEnabled: true,
        safetyShields: ['content-safety'],
      };

      const result = buildMetaPrompt(
        'Help with Kubernetes',
        makeConfig({ model: 'llama-3' }),
        caps,
      );

      expect(result.input).toContain('CONNECTED TOOLS');
      expect(result.input).toContain('[k8s-mcp]');
      expect(result.input).toContain('get_pod_logs');
      expect(result.input).toContain('Retrieve logs from a Kubernetes pod');
      expect(result.input).toContain('[jira-mcp]');
      expect(result.input).toContain('create_ticket');
      expect(result.input).toContain('KNOWLEDGE BASE (RAG)');
      expect(result.input).toContain('docs-store');
      expect(result.input).toContain('SAFETY: enabled');
      expect(result.input).toContain('BUILT-IN TOOLS: Web Search');
      expect(result.input).not.toContain('Code Interpreter');
    });

    it('falls back to extractToolContext when capabilities have no tools', () => {
      const result = buildMetaPrompt(
        'Just chat',
        makeConfig({ enableWebSearch: true }),
        { enableWebSearch: false, enableCodeInterpreter: false },
      );
      expect(result.input).toContain('Web Search: enabled');
      expect(result.input).not.toContain('CONNECTED TOOLS');
    });
  });
});
