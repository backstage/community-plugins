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

import { InputError } from '@backstage/errors';

/**
 * Validation for Kubernetes label selectors.
 *
 * Selectors arrive from client-supplied query parameters and are forwarded to
 * upstream APIs, so they are validated here before ever leaving the backend.
 */

/**
 * A label key: an optional DNS-subdomain prefix followed by `/`, then the name.
 * Both segments must start and end alphanumerically.
 */
const LABEL_KEY =
  '([a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\\.[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\/)?[a-zA-Z_]([a-zA-Z0-9._-]*[a-zA-Z0-9_])?';

/** A label value. Empty is legal, so `key=` matches labels with a blank value. */
const LABEL_VALUE = '([a-zA-Z0-9]([a-zA-Z0-9._-]{0,61}[a-zA-Z0-9])?)?';

/** Equality based, for example `app=web`, `app==web` or `app!=web`. */
const EQUALITY_EXPRESSION = new RegExp(
  `^${LABEL_KEY}\\s*(==?|!=)\\s*${LABEL_VALUE}$`,
);

/** Set based, for example `env in (prod, staging)` or `env notin (dev)`. */
const SET_EXPRESSION = new RegExp(
  `^${LABEL_KEY}\\s+(in|notin)\\s+\\(\\s*${LABEL_VALUE}(\\s*,\\s*${LABEL_VALUE})*\\s*\\)$`,
);

/** Existence based, for example `app` (present) or `!app` (absent). */
const EXISTENCE_EXPRESSION = new RegExp(`^!?${LABEL_KEY}$`);

function isValidExpression(expression: string): boolean {
  const trimmed = expression.trim();
  if (trimmed.length === 0) return false;

  return (
    EQUALITY_EXPRESSION.test(trimmed) ||
    SET_EXPRESSION.test(trimmed) ||
    EXISTENCE_EXPRESSION.test(trimmed)
  );
}

/**
 * Splits a selector on its top-level commas.
 *
 * A plain `split(',')` would be wrong, because set-based expressions contain
 * commas inside their parentheses — `env in (prod,staging)` is one expression,
 * not two. So commas are only treated as separators at paren depth zero.
 */
function splitExpressions(selector: string): string[] {
  const expressions: string[] = [];
  let current = '';
  let depth = 0;

  for (const character of selector) {
    if (character === '(') {
      depth++;
    } else if (character === ')') {
      // Clamped so an unbalanced ')' cannot drive the depth negative and make
      // subsequent commas look nested.
      depth = Math.max(0, depth - 1);
    } else if (character === ',' && depth === 0) {
      expressions.push(current);
      current = '';
      continue;
    }
    current += character;
  }

  if (current.length > 0) expressions.push(current);
  return expressions;
}

/**
 * Checks a full label selector.
 *
 * @returns A human-readable reason when invalid, or `undefined` when valid.
 */
export function validateLabelSelector(selector: string): string | undefined {
  const trimmed = selector.trim();

  if (trimmed.length === 0) {
    return 'selector must not be empty';
  }
  // Caught explicitly because splitting would otherwise yield no final
  // expression and the trailing comma would pass unnoticed.
  if (trimmed.endsWith(',')) {
    return 'selector must not end with a comma';
  }

  const invalid = splitExpressions(trimmed).filter(
    expression => !isValidExpression(expression),
  );

  if (invalid.length > 0) {
    const quoted = invalid.map(e => `"${e.trim()}"`).join(', ');
    return `invalid expressions: ${quoted}`;
  }

  return undefined;
}

/**
 * Throws an `InputError` if the selector is invalid.
 *
 * `InputError` maps to a 400 response, which is correct here since an invalid
 * selector is always a caller mistake.
 */
export function assertValidLabelSelector(selector: string): void {
  const reason = validateLabelSelector(selector);
  if (reason) {
    throw new InputError(`Invalid label selector: ${reason}`);
  }
}
