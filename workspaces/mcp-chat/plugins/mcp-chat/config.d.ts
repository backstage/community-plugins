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
  /** Configuration options for the MCP Chat plugin */
  mcpChat?: {
    /**
     * Quick prompts configuration for the frontend
     * @visibility frontend
     */
    quickPrompts?: Array<{
      /**
       * Title of the quick prompt
       * @visibility frontend
       */
      title: string;
      /**
       * Description of what the prompt does
       * @visibility frontend
       */
      description: string;
      /**
       * The actual prompt text to be used
       * @visibility frontend
       */
      prompt: string;
      /**
       * Category to group related prompts
       * @visibility frontend
       */
      category: string;
    }>;
  };
}
