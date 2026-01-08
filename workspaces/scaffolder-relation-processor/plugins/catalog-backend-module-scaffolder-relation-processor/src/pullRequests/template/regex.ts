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
 * Matches template variables in the format ${{ ... }}
 * Example: ${{ values.name }}, ${{ values.description }}
 */
export const TEMPLATE_VARIABLE_REGEX = /\$\{\{[^}]+\}\}/;

/**
 * Extracts the key from a key: value pair line (everything before the colon)
 * Example: "name: value" -> "name"
 */
export const KEY_VALUE_EXTRACTION_REGEX = /^([^:]+):/;

/**
 * Matches Jinja2 conditional statements
 * Examples: {%- if ... %}, {% if ... %}, {%- endif %}, {% endif %}, etc.
 */
export const JINJA2_CONDITIONAL_REGEX =
  /^{%-?\s*(if|endif|elif|else|endfor|for|endblock|block)\s+.*%}|^{%-?\s*(endif|endfor|endblock)\s*%}/;
