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

/**
 * Sanitize LLM response text to remove internal file reference tokens
 * These tokens look like <|file-3bf6634762184a15900d7d568264430a|> and should not be shown to users
 *
 * @param text - The raw text from the LLM response
 * @returns Sanitized text with internal tokens removed
 */
export function sanitizeResponseText(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // Remove file reference tokens: <|file-hexstring|>
  sanitized = sanitized.replace(/<\|file-[a-f0-9]+\|>/gi, '');

  // Smaller models sometimes emit tool invocations as plain text instead of
  // structured tool_call events.  Strip all common patterns:
  //   [Execute rag_search tool with query "what is a dog"]
  //   [Execute meadow_tool]
  //   [Execute knowledge_search]
  sanitized = sanitized.replace(/\[Execute\s+[^\]]+\]\n*/gi, '');

  // [rag_search(query="...")]  or  [some_tool()]
  sanitized = sanitized.replace(/\[\w+\([^\)]*\)\]\n*/g, '');

  // Standalone tool-name brackets that follow common naming conventions
  // e.g. [rag_search]  [meadow_tool]  [knowledge_base_search]
  // but NOT markdown links [text](url) or footnotes [1]
  sanitized = sanitized.replace(/\[\w+(?:_\w+)+\]\n*/g, '');

  return sanitized.trimStart();
}
