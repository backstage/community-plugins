/*
 * Copyright 2026 The Backstage Authors
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
 * Removes docstring-style indentation, following Python's `inspect.cleandoc`
 * semantics: the first line is treated separately (its leading whitespace is
 * stripped), and the common leading indentation of the *remaining* non-empty
 * lines is removed from them.
 *
 * MCP tool descriptions usually come from Python docstrings where the first
 * line is flush but the body is indented to the docstring's column. A naive
 * common-minimum dedent fails there (the flush first line forces min=0), so the
 * indented body would be mis-parsed as a Markdown code block.
 */
export function dedent(text: string): string {
  const lines = text.replace(/\t/g, '    ').split('\n');
  if (lines.length === 0) return '';
  const rest = lines.slice(1).filter(line => line.trim().length > 0);
  const min = rest.length
    ? Math.min(...rest.map(line => line.match(/^ */)?.[0].length ?? 0))
    : 0;
  const out = [
    lines[0].replace(/^\s+/, ''),
    ...lines.slice(1).map(line => line.slice(min)),
  ];
  return out.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');
}
