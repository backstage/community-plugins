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

/**
 * Detailed tool information sent from the frontend's capabilities selector.
 * Includes actual MCP tool descriptions so the meta-prompt can reference
 * what each tool does, not just that it exists.
 */
export interface ToolCapabilityInfo {
  name: string;
  description?: string;
  serverLabel?: string;
}

/**
 * User-selected capabilities to emphasize in the generated prompt.
 * When provided, the meta-prompt uses this detailed context instead of
 * the basic EffectiveConfig summary.
 */
export interface PromptCapabilities {
  tools?: ToolCapabilityInfo[];
  enableWebSearch?: boolean;
  enableCodeInterpreter?: boolean;
  ragEnabled?: boolean;
  vectorStoreNames?: string[];
  safetyEnabled?: boolean;
  safetyShields?: string[];
}

export function extractToolContext(config: EffectiveConfig): string {
  const lines: string[] = [];

  lines.push(`- Model: ${config.model}`);
  lines.push(
    `- Web Search: ${config.enableWebSearch ? 'enabled' : 'disabled'}`,
  );
  lines.push(
    `- Code Interpreter: ${
      config.enableCodeInterpreter ? 'enabled' : 'disabled'
    }`,
  );

  if (config.mcpServers && config.mcpServers.length > 0) {
    const names = config.mcpServers.map(s => s.name || s.id).join(', ');
    lines.push(`- MCP Servers: ${names}`);
  } else {
    lines.push('- MCP Servers: none configured');
  }

  const storeCount = config.vectorStoreIds?.length ?? 0;
  lines.push(
    `- RAG / Knowledge Base: ${
      storeCount > 0 ? `${storeCount} active vector store(s)` : 'not configured'
    }`,
  );

  if (config.safetyEnabled) {
    const shields = [
      ...(config.inputShields ?? []),
      ...(config.outputShields ?? []),
    ];
    lines.push(
      `- Safety Shields: enabled (${
        shields.length > 0 ? shields.join(', ') : 'default'
      })`,
    );
  } else {
    lines.push('- Safety Shields: disabled');
  }

  if (config.evaluationEnabled) {
    lines.push(`- Response Evaluation: enabled`);
  }

  return lines.join('\n');
}

/**
 * Build a rich capabilities section from the user's selected capabilities.
 * Unlike extractToolContext, this includes actual tool descriptions so the
 * LLM can generate specific, actionable instructions referencing each tool.
 */
function buildDetailedCapabilitiesSection(
  capabilities: PromptCapabilities,
  config: EffectiveConfig,
): string {
  const sections: string[] = [];

  sections.push(`MODEL: ${config.model}`);

  // Built-in tools
  const builtIn: string[] = [];
  if (capabilities.enableWebSearch) builtIn.push('Web Search');
  if (capabilities.enableCodeInterpreter) builtIn.push('Code Interpreter');
  if (builtIn.length > 0) {
    sections.push(`\nBUILT-IN TOOLS: ${builtIn.join(', ')}`);
  }

  // MCP tools with descriptions
  if (capabilities.tools && capabilities.tools.length > 0) {
    const byServer = new Map<string, ToolCapabilityInfo[]>();
    for (const t of capabilities.tools) {
      const key = t.serverLabel || 'general';
      if (!byServer.has(key)) byServer.set(key, []);
      byServer.get(key)!.push(t);
    }

    const toolLines: string[] = [];
    for (const [server, tools] of byServer) {
      toolLines.push(`  [${server}]`);
      for (const t of tools) {
        const desc = t.description ? ` — ${t.description}` : '';
        toolLines.push(`    • ${t.name}${desc}`);
      }
    }
    sections.push(
      `\nCONNECTED TOOLS (the agent can call these):\n${toolLines.join('\n')}`,
    );
  }

  // Knowledge base / RAG
  if (capabilities.ragEnabled) {
    const storeInfo = capabilities.vectorStoreNames?.length
      ? `active stores: ${capabilities.vectorStoreNames.join(', ')}`
      : 'enabled';
    sections.push(`\nKNOWLEDGE BASE (RAG): ${storeInfo}`);
    sections.push(
      '  The agent can search uploaded documents for relevant context before answering.',
    );
  }

  // Safety
  if (capabilities.safetyEnabled) {
    const shields = capabilities.safetyShields?.length
      ? capabilities.safetyShields.join(', ')
      : 'default shields';
    sections.push(`\nSAFETY: enabled (${shields})`);
  }

  return sections.join('\n');
}

/**
 * Permanent system-level instructions for the prompt generation agent.
 * Sent as the Responses API `instructions` field to clearly separate the
 * agent's role from the user-provided context in `input`.
 */
export const PROMPT_ENGINEER_INSTRUCTIONS = `You are an expert AI prompt engineer specializing in creating production-quality system prompts (agent instructions) for AI assistants deployed on enterprise platforms.

Your task: Given the user's natural-language description of what they want their agent to do, together with a list of the agent's actually available capabilities and tools, generate a complete, ready-to-use system prompt.

REQUIREMENTS FOR THE GENERATED PROMPT:
1. Start with a clear, concise role definition ("You are...")
2. Reference EACH available tool by name and explain when the agent should use it — be specific about tool names and their purposes
3. If a knowledge base (RAG) is available, instruct the agent to search it before answering knowledge questions
4. Include behavioral guidelines: tone, safety boundaries, and response formatting
5. Be specific about what the agent should and should not do
6. If safety shields are enabled, include appropriate safety instructions
7. Keep the prompt between 150 and 500 words
8. Output ONLY the system prompt text — no meta-commentary, no markdown fencing, no explanations`;

export interface MetaPromptResult {
  instructions: string;
  input: string;
}

export function buildMetaPrompt(
  description: string,
  config: EffectiveConfig,
  capabilities?: PromptCapabilities,
): MetaPromptResult {
  const hasDetailedCaps =
    capabilities &&
    ((capabilities.tools && capabilities.tools.length > 0) ||
      capabilities.enableWebSearch ||
      capabilities.enableCodeInterpreter ||
      capabilities.ragEnabled);

  const capabilitiesSection = hasDetailedCaps
    ? buildDetailedCapabilitiesSection(capabilities, config)
    : extractToolContext(config);

  const input = `AVAILABLE CAPABILITIES:
${capabilitiesSection}

USER'S DESCRIPTION:
${description}

Generate the system prompt now.`;

  return {
    instructions: PROMPT_ENGINEER_INSTRUCTIONS,
    input,
  };
}
