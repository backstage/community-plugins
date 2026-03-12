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

export interface Config {
  /**
   * Configuration for Agentic Chat plugin
   *
   * Note: Branding configuration (colors, logos, theme presets) is
   * defined in the backend configuration and fetched via the /branding API.
   * See @backstage-community/plugin-agentic-chat-backend/config.d.ts
   * for branding options including:
   * - themePreset: 'default' | 'enterprise' | custom
   * - glassIntensity: 'subtle' | 'medium' | 'strong'
   * - primaryColor, secondaryColor, etc.
   */
  agenticChat?: {
    /**
     * Enable debug logging in the browser console
     * Can also be toggled via localStorage or browser console
     * @visibility frontend
     */
    debug?: boolean;

    /**
     * Llama Stack configuration (frontend-visible parts)
     */
    llamaStack?: {
      /**
       * Base URL for the Llama Stack server
       * @visibility frontend
       */
      baseUrl?: string;

      /**
       * Model to use for chat completions
       * @visibility frontend
       */
      model?: string;
    };

    /**
     * Quick prompts for common queries
     */
    quickPrompts?: Array<{
      /**
       * Title of the quick prompt
       * @visibility frontend
       */
      title: string;

      /**
       * Description of what this prompt does
       * @visibility frontend
       */
      description: string;

      /**
       * The actual prompt text
       * @visibility frontend
       */
      prompt: string;

      /**
       * Category for grouping prompts
       * @visibility frontend
       */
      category: string;
    }>;
  };
}
