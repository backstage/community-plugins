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

import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { LiteLLMProvider } from './litellm-provider';
import { OllamaProvider } from './ollama-provider';
import { ChatMessage } from '../types';

describe('Provider maxTokens and temperature configuration', () => {
  const testMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello, how are you?' },
  ];

  describe('OpenAIProvider', () => {
    it('should use custom maxTokens and temperature in requests', () => {
      const provider = new OpenAIProvider({
        type: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3,
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(2000);
      expect(request.temperature).toBe(0.3);
      expect(request.model).toBe('gpt-4');
    });

    it('should use default values when not specified', () => {
      const provider = new OpenAIProvider({
        type: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(1000); // Default
      expect(request.temperature).toBe(0.7); // Default
    });
  });

  describe('ClaudeProvider', () => {
    it('should use custom maxTokens and temperature in requests', () => {
      const provider = new ClaudeProvider({
        type: 'claude',
        apiKey: 'test-key',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3',
        maxTokens: 2048,
        temperature: 0.9,
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(2048);
      expect(request.temperature).toBe(0.9);
    });

    it('should use default maxTokens when not specified', () => {
      const provider = new ClaudeProvider({
        type: 'claude',
        apiKey: 'test-key',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3',
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(4096); // Default
      // Temperature is not set by default for Claude
      expect(request.temperature).toBeUndefined();
    });
  });

  describe('GeminiProvider', () => {
    it('should use custom maxTokens and temperature', () => {
      const provider = new GeminiProvider({
        type: 'gemini',
        apiKey: 'test-key',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-pro',
        maxTokens: 4096,
        temperature: 0.8,
      });

      // Check that the values are stored in the model config
      expect((provider as any).maxTokens).toBe(4096);
      expect((provider as any).temperature).toBe(0.8);
    });

    it('should use defaults when not specified', () => {
      const provider = new GeminiProvider({
        type: 'gemini',
        apiKey: 'test-key',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-pro',
      });

      expect((provider as any).maxTokens).toBeUndefined();
      expect((provider as any).temperature).toBeUndefined();
    });
  });

  describe('LiteLLMProvider', () => {
    it('should use custom maxTokens and temperature in requests', () => {
      const provider = new LiteLLMProvider({
        type: 'litellm',
        apiKey: 'test-key',
        baseUrl: 'http://localhost:4000',
        model: 'gpt-4',
        maxTokens: 1500,
        temperature: 0.4,
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(1500);
      expect(request.temperature).toBe(0.4);
    });

    it('should use defaults when not specified', () => {
      const provider = new LiteLLMProvider({
        type: 'litellm',
        apiKey: 'test-key',
        baseUrl: 'http://localhost:4000',
        model: 'gpt-4',
      });

      const request = (provider as any).formatRequest(testMessages);

      expect(request.max_tokens).toBe(1000); // Default
      expect(request.temperature).toBe(0.7); // Default
    });
  });

  describe('OllamaProvider', () => {
    it('should use custom maxTokens and temperature in options', () => {
      const provider = new OllamaProvider({
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
        maxTokens: 1500,
        temperature: 0.6,
      });

      expect((provider as any).maxTokens).toBe(1500);
      expect((provider as any).temperature).toBe(0.6);
    });

    it('should use defaults when not specified', () => {
      const provider = new OllamaProvider({
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
      });

      expect((provider as any).maxTokens).toBeUndefined();
      expect((provider as any).temperature).toBeUndefined();
    });
  });

  describe('Provider defaults comparison', () => {
    it('should have correct default values for each provider type', () => {
      const providers = [
        {
          name: 'OpenAI',
          instance: new OpenAIProvider({
            type: 'openai',
            apiKey: 'test',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4',
          }),
          expectedMaxTokens: 1000,
          expectedTemperature: 0.7,
        },
        {
          name: 'Claude',
          instance: new ClaudeProvider({
            type: 'claude',
            apiKey: 'test',
            baseUrl: 'https://api.anthropic.com/v1',
            model: 'claude-3',
          }),
          expectedMaxTokens: 4096,
          expectedTemperature: undefined,
        },
        {
          name: 'LiteLLM',
          instance: new LiteLLMProvider({
            type: 'litellm',
            apiKey: 'test',
            baseUrl: 'http://localhost:4000',
            model: 'gpt-4',
          }),
          expectedMaxTokens: 1000,
          expectedTemperature: 0.7,
        },
      ];

      providers.forEach(
        ({ instance, expectedMaxTokens, expectedTemperature }) => {
          const request = (instance as any).formatRequest(testMessages);
          expect(request.max_tokens).toBe(expectedMaxTokens);
          expect(request.temperature).toBe(expectedTemperature);
        },
      );
    });
  });
});
