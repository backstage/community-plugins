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
import type {
  ToolCallState,
  StreamingState,
} from '../components/StreamingMessage';
import type { Message } from '../types';

const MIN_ECHO_LENGTH = 60;

/**
 * Find top-level JSON objects/arrays in text using bracket counting.
 * Unlike regex, this handles nested braces and JSON strings correctly.
 */
export function findJsonBlocks(
  text: string,
): Array<{ start: number; end: number }> {
  const blocks: Array<{ start: number; end: number }> = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (ch !== '{' && ch !== '[') {
      i++;
      continue;
    }

    const start = i;
    const opener = ch;
    const closer = ch === '{' ? '}' : ']';
    let depth = 1;
    let inStr = false;
    let esc = false;
    i++;

    while (i < text.length && depth > 0) {
      const c = text[i];
      if (esc) {
        esc = false;
      } else if (c === '\\' && inStr) {
        esc = true;
      } else if (c === '"') {
        inStr = !inStr;
      } else if (!inStr) {
        if (c === opener) depth++;
        else if (c === closer) depth--;
      }
      i++;
    }

    if (depth === 0) {
      const candidate = text.slice(start, i);
      if (candidate.length >= MIN_ECHO_LENGTH) {
        try {
          JSON.parse(candidate);
          blocks.push({ start, end: i });
        } catch {
          // Not valid JSON despite balanced braces
        }
      }
    }
  }

  return blocks;
}

/**
 * Canonicalize a string for comparison: parse as JSON and re-serialize
 * to normalize whitespace and formatting differences.
 */
function canonicalize(s: string): string | null {
  try {
    return JSON.stringify(JSON.parse(s));
  } catch {
    return null;
  }
}

/**
 * Strip JSON blocks from response text that are duplicates of tool outputs.
 * Only removes JSON that structurally matches a known tool output — never
 * strips JSON the model intentionally included for the user.
 *
 * Why: LLMs using the Responses API often echo back the raw tool output
 * in their text response. Since the ToolCallsSection already renders tool
 * outputs in a dedicated, collapsible UI, showing the same data as a
 * JSON code block creates a confusing duplicate.
 */
export function stripEchoedToolOutput(
  text: string,
  toolCalls: ToolCallState[],
): string {
  if (!text || toolCalls.length === 0) return text;

  const canonicalOutputs = new Set<string>();
  for (const tc of toolCalls) {
    if (tc.output && tc.output.length >= MIN_ECHO_LENGTH) {
      const c = canonicalize(tc.output);
      if (c) canonicalOutputs.add(c);
    }
    if (tc.arguments && tc.arguments.length >= MIN_ECHO_LENGTH) {
      const c = canonicalize(tc.arguments);
      if (c) canonicalOutputs.add(c);
    }
  }

  if (canonicalOutputs.size === 0) return text;

  const blocks = findJsonBlocks(text);
  if (blocks.length === 0) return text;

  let cleaned = text;
  for (let idx = blocks.length - 1; idx >= 0; idx--) {
    const block = blocks[idx];
    const blockText = cleaned.slice(block.start, block.end);
    const c = canonicalize(blockText);
    if (c && canonicalOutputs.has(c)) {
      cleaned = cleaned.slice(0, block.start) + cleaned.slice(block.end);
    }
  }

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}

/**
 * Generate a fallback response text when the model didn't generate text
 * but tool calls were executed. Summarizes tool execution results.
 */
export function getFallbackResponseText(
  toolCallsWithOutput: ToolCallState[],
): string {
  const hasErrors = toolCallsWithOutput.some(tc => tc.error);
  const completedCount = toolCallsWithOutput.filter(tc => !tc.error).length;
  const errorCount = toolCallsWithOutput.filter(tc => tc.error).length;

  if (hasErrors && completedCount === 0) {
    return `Tool execution failed. ${errorCount} tool${
      errorCount > 1 ? 's' : ''
    } encountered errors. Expand the tool details below for more information.`;
  }
  if (hasErrors) {
    return `Executed ${completedCount} tool${
      completedCount > 1 ? 's' : ''
    } successfully, ${errorCount} failed. See tool details below.`;
  }
  if (completedCount > 0) {
    return 'Tool execution completed successfully. See the results in the tool details below.';
  }
  return 'Tool execution completed. No additional response generated.';
}

/**
 * Generate an error message when a stream completes with no content at all
 * (no text and no tool calls).
 */
export function getEmptyStreamResponseText(
  completed: boolean,
  outputTokens: number | undefined,
  modelName: string | undefined,
): string {
  if (!completed) {
    return 'The connection ended without a response. Please try again.';
  }

  const zeroOutput = outputTokens === 0;
  if (zeroOutput && modelName) {
    return `Model "${modelName}" returned 0 output tokens. This usually means the model does not support the request format or is misconfigured on the server. Try a different model in the Admin Panel → Model & Tools → Model.`;
  }
  if (zeroOutput) {
    return 'The model returned 0 output tokens. It may not support the Responses API format. Check the model configuration in the Admin Panel.';
  }
  return 'No response received from the AI provider. This may indicate a configuration issue (wrong model, unreachable server, or missing capabilities). Check the backend logs for details.';
}

/**
 * Maps a ToolCallState to the Message toolCalls shape.
 */
function mapToolCallToMessage(tc: ToolCallState): {
  id: string;
  name: string;
  serverLabel: string;
  arguments: string;
  output?: string;
  error?: string;
} {
  return {
    id: tc.id,
    name: tc.name || tc.type || 'tool',
    serverLabel: tc.serverLabel || 'mcp-server',
    arguments: tc.arguments || '{}',
    output: tc.output,
    error: tc.error,
  };
}

/**
 * Builds the final bot Message from streaming state.
 * Computes response text (strip echoed tool output, fallbacks, empty stream handling)
 * and assembles the Message object.
 */
export function buildBotResponse(
  streamingState: StreamingState,
  messageId: string,
): Message {
  const toolCallsWithOutput = streamingState.toolCalls.filter(
    tc => tc.output || tc.error,
  );

  let responseText = streamingState.text;

  if (responseText && toolCallsWithOutput.length > 0) {
    responseText = stripEchoedToolOutput(responseText, toolCallsWithOutput);
  }

  if (
    !responseText &&
    streamingState.toolCalls.length > 0 &&
    !streamingState.pendingApproval
  ) {
    responseText = getFallbackResponseText(toolCallsWithOutput);
  }

  if (!responseText && streamingState.toolCalls.length === 0) {
    const isCompleted =
      streamingState.phase === 'completed' && streamingState.completed;
    responseText = getEmptyStreamResponseText(
      isCompleted,
      streamingState.usage?.output_tokens,
      streamingState.model,
    );
  }

  const timestamp = streamingState.serverTimestamp
    ? new Date(streamingState.serverTimestamp * 1000)
    : new Date();

  return {
    id: messageId,
    text: responseText,
    isUser: false,
    timestamp,
    toolCalls:
      streamingState.toolCalls.length > 0
        ? streamingState.toolCalls.map(mapToolCallToMessage)
        : undefined,
    ragSources: streamingState.ragSources,
    responseId: streamingState.responseId,
    usage: streamingState.usage,
    errorCode: streamingState.errorCode,
    reasoning: streamingState.reasoning || undefined,
    reasoningDuration: streamingState.reasoningDuration,
  };
}
