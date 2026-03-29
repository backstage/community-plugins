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
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { llmProviderExtensionPoint } from '@backstage-community/plugin-mcp-chat-node';
import type { Config } from '@backstage/config';
import { OpenAIProvider } from './OpenAIProvider';

/**
 * Reads the optional `auth` record from a provider config entry.
 * @param entry - The config entry to read auth from
 * @returns A record of string key-value pairs, or undefined if no auth config
 */
function readAuthRecord(entry: Config): Record<string, string> | undefined {
  const authConfig = entry.getOptionalConfig('auth');
  if (!authConfig) return undefined;
  const result: Record<string, string> = {};
  for (const key of authConfig.keys()) {
    result[key] = authConfig.getString(key);
  }
  return result;
}

/**
 * Backend module that registers the OpenAI LLM provider
 * with the mcp-chat backend plugin.
 *
 * @public
 */
export default createBackendModule({
  pluginId: 'mcp-chat',
  moduleId: 'openai',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        llmProviders: llmProviderExtensionPoint,
      },
      async init({ config, llmProviders }) {
        const providers =
          config.getOptionalConfigArray('mcpChat.providers') || [];
        const entry = providers.find(p => p.getString('id') === 'openai');

        if (!entry) return; // Skip registration if not configured

        const providerConfig = {
          type: 'openai',
          apiKey: entry.getOptionalString('token'),
          baseUrl:
            entry.getOptionalString('baseUrl') || 'https://api.openai.com/v1',
          model: entry.getString('model'),
          auth: readAuthRecord(entry),
        };

        llmProviders.registerProvider(
          'openai',
          new OpenAIProvider(providerConfig),
        );
      },
    });
  },
});
