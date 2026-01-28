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

import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { MCPClientService } from './MCPClientService';
import { ChatMessage } from '../types';

/** Default timeout for summarization requests in milliseconds */
const DEFAULT_SUMMARIZE_TIMEOUT = 3000;

/** Maximum length for generated titles */
const MAX_TITLE_LENGTH = 100;

/** System prompt for title generation - hardcoded to prevent prompt injection */
const SUMMARIZE_PROMPT = `Generate a 5-10 word title for this conversation.
Output ONLY the title. No quotes, no markdown, no punctuation at end.
If content is unclear or inappropriate, output "Chat Session".`;

/**
 * Options for creating a SummarizationService instance.
 *
 * @public
 */
export interface SummarizationServiceOptions {
  mcpClientService: MCPClientService;
  logger: LoggerService;
  config: Config;
}

/**
 * Service for generating AI-powered conversation titles.
 * Uses the configured LLM provider to summarize conversations into concise titles.
 * Falls back to first user message if summarization fails or times out.
 *
 * @public
 */
export class SummarizationService {
  private readonly mcpClientService: MCPClientService;
  private readonly logger: LoggerService;
  private readonly config: Config;

  constructor(options: SummarizationServiceOptions) {
    this.mcpClientService = options.mcpClientService;
    this.logger = options.logger;
    this.config = options.config;
  }

  /**
   * Generate a title for a conversation using the LLM.
   * Falls back to first user message on failure or timeout.
   *
   * @param messages - The conversation messages to summarize
   * @returns A concise title for the conversation
   */
  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    // Check if auto-summarization is enabled
    const autoSummarize = this.config.getOptionalBoolean(
      'mcpChat.conversationHistory.autoSummarize',
    );
    if (autoSummarize === false) {
      return this.getFallbackTitle(messages);
    }

    const timeout =
      this.config.getOptionalNumber(
        'mcpChat.conversationHistory.summarizeTimeout',
      ) || DEFAULT_SUMMARIZE_TIMEOUT;

    try {
      // Extract first 3 user messages for context (limit to reduce token usage)
      const userMessages = messages
        .filter(m => m.role === 'user' && m.content)
        .slice(0, 3)
        .map(m => m.content as string)
        .join('\n');

      if (!userMessages.trim()) {
        return 'Chat Session';
      }

      // Race between LLM call and timeout
      const response = await Promise.race([
        this.mcpClientService.processQuery(
          [
            {
              role: 'user',
              content: `${SUMMARIZE_PROMPT}\n\nConversation:\n${userMessages}`,
            },
          ],
          [], // No tools for summarization
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Summarization timeout')), timeout),
        ),
      ]);

      // Sanitize and truncate the response
      const title = this.sanitizeTitle(response.reply);
      return title.slice(0, MAX_TITLE_LENGTH);
    } catch (error) {
      this.logger.warn(`Summarization failed, using fallback: ${error}`);
      return this.getFallbackTitle(messages);
    }
  }

  /**
   * Sanitize a title to remove potential XSS vectors and formatting issues.
   */
  private sanitizeTitle(title: string): string {
    return title
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/["'`]/g, '') // Remove quotes that could cause issues
      .replace(/\n/g, ' ') // Convert to single line
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Generate a fallback title from the first user message.
   * Used when LLM summarization fails or is disabled.
   */
  private getFallbackTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage || !firstUserMessage.content) {
      return 'Chat Session';
    }

    const content = firstUserMessage.content.trim();
    if (content.length <= 50) {
      return content;
    }

    // Truncate with ellipsis
    return `${content.slice(0, 47)}...`;
  }
}
