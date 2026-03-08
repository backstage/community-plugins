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
 * Formats response text for better readability.
 * Detects common patterns and converts them to markdown.
 *
 * @param text - The input text to format
 * @returns Formatted text with markdown
 */
export function formatResponseText(text: string): string {
  if (!text) return text;

  let formatted = text;

  // Pattern 0: Detect log-like content (lines starting with timestamps, log levels, or controller output)
  // Common log patterns: I1216, W1216, E1216, 2024-12-24, [INFO], reflector.go:359, controller.go:248
  const logLinePattern =
    /^[IWE]\d{4}\s|\^\d{4}-\d{2}-\d{2}|\[\w+\].*\d{2}:\d{2}:\d{2}|reflector\.go:\d+|controller\.go:\d+/;
  const lines = formatted.split('\n');
  let consecutiveLogLines = 0;
  let logStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (logLinePattern.test(lines[i])) {
      if (consecutiveLogLines === 0) logStartIndex = i;
      consecutiveLogLines++;
    } else if (consecutiveLogLines >= 3) {
      // We found a block of log lines, wrap them in a code block
      const logBlock = lines.slice(logStartIndex, i).join('\n');
      const before = lines.slice(0, logStartIndex).join('\n');
      const after = lines.slice(i).join('\n');
      formatted = `${before}\n\n\`\`\`text\n${logBlock}\n\`\`\`\n\n${after}`;
      break; // Only process first block for now
    } else {
      consecutiveLogLines = 0;
      logStartIndex = -1;
    }
  }

  // If we ended with log lines
  if (consecutiveLogLines >= 3 && logStartIndex >= 0) {
    const logBlock = lines.slice(logStartIndex).join('\n');
    const before = lines.slice(0, logStartIndex).join('\n');
    formatted = `${before}\n\n\`\`\`text\n${logBlock}\n\`\`\``;
  }

  // Pattern 1: Long comma-separated lists (more than 5 items)
  // Convert to bullet list if line contains many comma-separated items
  formatted = formatted.replace(
    /^([^:\n]+:\s*)?([a-zA-Z0-9_-]+(?:,\s*[a-zA-Z0-9_-]+){5,})\.?$/gm,
    (_match, prefix, items) => {
      const itemList = items
        .split(/,\s*/)
        .map((item: string) => `- ${item.trim()}`)
        .join('\n');
      return prefix ? `${prefix}\n\n${itemList}` : itemList;
    },
  );

  // Pattern 2: Detect JSON objects/arrays in the text and format as code blocks
  // Skip trivial/empty JSON like [], {}, or very short content
  formatted = formatted.replace(
    /(?<![`\n])(\{[\s\S]*?\}|\[[\s\S]*?\])(?![`])/g,
    match => {
      // Skip empty or trivial JSON - don't format [], {}, or whitespace-only content
      const trimmed = match.trim();
      if (trimmed === '[]' || trimmed === '{}' || trimmed.length < 5) {
        return match;
      }

      try {
        const parsed = JSON.parse(match);

        // Skip empty arrays/objects
        if (Array.isArray(parsed) && parsed.length === 0) {
          return match;
        }
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          Object.keys(parsed).length === 0
        ) {
          return match;
        }

        const prettyJson = JSON.stringify(parsed, null, 2);
        return `\n\`\`\`json\n${prettyJson}\n\`\`\`\n`;
      } catch {
        return match; // Not valid JSON, leave as-is
      }
    },
  );

  // Pattern 3: Detect key: value pairs and format as a list
  const keyValuePattern = /^(\w+):\s+(.+)$/gm;
  let keyValueMatches = 0;
  formatted.replace(keyValuePattern, () => {
    keyValueMatches++;
    return '';
  });
  if (keyValueMatches >= 3) {
    formatted = formatted.replace(keyValuePattern, '- **$1:** $2');
  }

  return formatted;
}

/**
 * Formats tool output for display.
 * Handles JSON, lists, and other structured data.
 *
 * @param output - The tool output string
 * @returns Formatted output
 */
export function formatToolOutput(output: string): string {
  if (!output) return output;

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(output);

    // If it's an array of simple strings, format as bullet list
    if (
      Array.isArray(parsed) &&
      parsed.every(item => typeof item === 'string')
    ) {
      if (parsed.length > 10) {
        // For very long lists, show count and first/last few
        const first = parsed
          .slice(0, 5)
          .map(item => `- ${item}`)
          .join('\n');
        const last = parsed
          .slice(-3)
          .map(item => `- ${item}`)
          .join('\n');
        return `${first}\n- ... *(${parsed.length - 8} more items)*\n${last}`;
      }
      return parsed.map(item => `- ${item}`).join('\n');
    }

    // If it's an array of objects, try to format as table
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === 'object'
    ) {
      const keys = Object.keys(parsed[0]);
      if (keys.length <= 5) {
        // Format as markdown table
        const header = `| ${keys.join(' | ')} |`;
        const separator = `| ${keys.map(() => '---').join(' | ')} |`;
        const rows = parsed
          .slice(0, 20)
          .map(row => `| ${keys.map(k => String(row[k] ?? '')).join(' | ')} |`)
          .join('\n');
        const result = `${header}\n${separator}\n${rows}`;
        if (parsed.length > 20) {
          return `${result}\n\n*... and ${parsed.length - 20} more rows*`;
        }
        return result;
      }
    }

    // Otherwise, pretty print the JSON
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Not JSON, try other patterns
  }

  // Check for comma-separated list
  const items = output.split(/,\s*/);
  if (items.length > 5 && items.every(item => item.length < 100)) {
    return items.map(item => `- ${item.trim()}`).join('\n');
  }

  return output;
}
