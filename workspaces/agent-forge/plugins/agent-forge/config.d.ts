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
  agentForge: {
    /**
     * The base URL for the Agent Forge backend API
     * @visibility frontend
     */
    baseUrl: string;

    /**
     * The name of the AI bot to display in the UI
     * @visibility frontend
     */
    botName?: string;

    /**
     * The icon URL or path for the AI bot
     * @visibility frontend
     */
    botIcon?: string;

    /**
     * Initial suggestion prompts to show users
     * @visibility frontend
     */
    initialSuggestions?: string[];

    /**
     * Thinking messages to rotate while the AI is processing
     * @visibility frontend
     */
    thinkingMessages?: string[];

    /**
     * Interval in milliseconds for rotating thinking messages (default: 7000)
     * @visibility frontend
     */
    thinkingMessagesInterval?: number;

    /**
     * HTTP request timeout in seconds (default: 300)
     * @visibility frontend
     */
    requestTimeout?: number;

    /**
     * Enable streaming responses (default: false)
     * @visibility frontend
     */
    enableStreaming?: boolean;

    /**
     * The API ID for the OpenIdConnectApi (default: 'auth.duo.oidc')
     * @visibility frontend
     */
    authApiId?: string;

    /**
     * Whether to use the OpenIdConnectApi.getIdToken() method for authentication (default: false)
     * @visibility frontend
     */
    useOpenIDToken?: boolean;

    /**
     * Automatically reload the page when OpenID token expires (default: true)
     * Only applies when useOpenIDToken is true
     * @visibility frontend
     */
    autoReloadOnTokenExpiry?: boolean;

    /**
     * The header title to display (default: bot name)
     * @visibility frontend
     */
    headerTitle?: string;

    /**
     * The header subtitle to display (default: "AI Platform Engineer Assistant")
     * @visibility frontend
     */
    headerSubtitle?: string;

    /**
     * The placeholder text for the input field (default: "Ask {botName} anything...")
     * @visibility frontend
     */
    inputPlaceholder?: string;

    /**
     * Font size configuration for various UI elements
     * @visibility frontend
     */
    fontSize?: {
      /**
       * Header title font size (default: "1.125rem")
       */
      headerTitle?: string;
      /**
       * Header subtitle font size (default: "0.75rem")
       */
      headerSubtitle?: string;
      /**
       * Chat message text font size (default: "0.875rem")
       */
      messageText?: string;
      /**
       * Code block font size (default: "0.9rem")
       */
      codeBlock?: string;
      /**
       * Inline code font size (default: "0.875rem")
       */
      inlineCode?: string;
      /**
       * Suggestion chip font size (default: "0.875rem")
       */
      suggestionChip?: string;
      /**
       * Sidebar text font size (default: "0.875rem")
       */
      sidebarText?: string;
      /**
       * Input field font size (default: "1rem")
       */
      inputField?: string;
      /**
       * Timestamp font size (default: "0.75rem")
       */
      timestamp?: string;
    };
  };
}
