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
  TEMPLATE_VARIABLE_REGEX,
  KEY_VALUE_EXTRACTION_REGEX,
  JINJA2_CONDITIONAL_REGEX,
} from './regex';

/**
 * Removes quotes from a string if present
 *
 * @param str - String that may be quoted
 * @returns String with quotes removed
 *
 * @internal
 */
function removeQuotes(str: string): string {
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    return str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Extracts and normalizes a key from a key: value pair line
 *
 * @param line - Line to extract key from
 * @returns Normalized key (without quotes), or null if no key found
 *
 * @internal
 */
function extractKeyFromKeyValuePair(line: string): string | null {
  const keyMatch = line.match(KEY_VALUE_EXTRACTION_REGEX);
  if (!keyMatch) {
    return null;
  }

  const key = keyMatch[1].trim();
  return removeQuotes(key);
}

/**
 * Replaces a template line with the corresponding scaffolded line
 * Matches lines by key and replaces the entire template line with the scaffolded line
 *
 * @param templateLine - Line from template file
 * @param scaffoldedLine - Corresponding line from scaffolded file
 * @returns The scaffolded line if keys match, otherwise the original template line
 *
 * @internal
 */
function replaceTemplateVariables(
  templateLine: string,
  scaffoldedLine: string,
): string {
  if (!TEMPLATE_VARIABLE_REGEX.test(templateLine)) {
    return templateLine;
  }

  const templateKey = extractKeyFromKeyValuePair(templateLine);
  const scaffoldedKey = extractKeyFromKeyValuePair(scaffoldedLine);

  if (!templateKey || !scaffoldedKey) {
    // No key found in one or both lines, can't match - return original
    return templateLine;
  }

  if (templateKey === scaffoldedKey) {
    return scaffoldedLine;
  }

  return templateLine;
}

/**
 * Checks if a line is a Jinja2 conditional that should be ignored
 * Matches patterns like {%- if ... %}, {%- endif %}, {% if ... %}, {% endif %}, etc.
 *
 * @param line - Line to check
 * @returns True if the line is a Jinja2 conditional to ignore
 *
 * @internal
 */
function isJinja2Conditional(line: string): boolean {
  const trimmed = line.trim();
  return JINJA2_CONDITIONAL_REGEX.test(trimmed);
}

/**
 * Builds a map of YAML keys to their corresponding lines from scaffolded content
 *
 * @param scaffoldedLines - Array of lines from scaffolded file
 * @returns Map of normalized keys to their original lines
 *
 * @internal
 */
function buildScaffoldedKeyMap(scaffoldedLines: string[]): Map<string, string> {
  const keyMap = new Map<string, string>();

  for (const line of scaffoldedLines) {
    const key = extractKeyFromKeyValuePair(line.trim());
    if (key && !keyMap.has(key)) {
      // Store the first occurrence of each key
      keyMap.set(key, line);
    }
  }

  return keyMap;
}

/**
 * Processes a template line that contains template variables
 *
 * @param templateLine - Line from template file
 * @param scaffoldedKeyMap - Map of keys to scaffolded lines
 * @returns Processed line if the key is found in the scaffolded key map, otherwise the original template line
 *
 * @internal
 */
function processTemplateVariableLine(
  templateLine: string,
  scaffoldedKeyMap: Map<string, string>,
): string | null {
  const templateKey = extractKeyFromKeyValuePair(templateLine);

  if (!templateKey) {
    return templateLine;
  }

  const scaffoldedLine = scaffoldedKeyMap.get(templateKey);

  if (scaffoldedLine) {
    return replaceTemplateVariables(templateLine, scaffoldedLine);
  }

  return templateLine;
}

/**
 * Preprocesses template content by replacing template variables with values from scaffolded content
 * Also removes Jinja2 conditional lines that won't be in scaffolded files
 *
 * @param templateContent - Content from template file
 * @param scaffoldedContent - Content from scaffolded file
 * @returns Preprocessed template content with variables replaced and conditionals removed
 *
 * @internal
 */
export function preprocessTemplate(
  templateContent: string,
  scaffoldedContent: string,
): string {
  const templateLines = templateContent.split('\n');
  const scaffoldedLines = scaffoldedContent.split('\n');
  const scaffoldedKeyMap = buildScaffoldedKeyMap(scaffoldedLines);
  const processedLines: string[] = [];

  for (let i = 0; i < templateLines.length; i++) {
    const templateLine = templateLines[i];

    if (isJinja2Conditional(templateLine)) {
      continue;
    }

    if (TEMPLATE_VARIABLE_REGEX.test(templateLine)) {
      const processedLine = processTemplateVariableLine(
        templateLine,
        scaffoldedKeyMap,
      );

      if (processedLine !== null) {
        processedLines.push(processedLine);
      }
    } else {
      // No template variables, keep as-is
      processedLines.push(templateLine);
    }
  }

  return processedLines.join('\n');
}
