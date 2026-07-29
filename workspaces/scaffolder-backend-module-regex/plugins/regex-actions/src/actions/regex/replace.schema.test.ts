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
import { z } from 'zod/v3';

import { regExpsSchema } from './replace.schema';

// Calling the action handler in a mock environment does not run Zod
// validation (see replace.test.ts), so we exercise the schema directly
// here to cover the `pattern` refine branch.

describe('regex:replace input schema', () => {
  const schema = regExpsSchema(z);

  const baseItem = {
    replacement: 'monkey',
    values: [{ key: 'eg1', value: 'The lazy dog' }],
  };

  it('accepts a bare pattern with no leading or trailing forward slash', () => {
    const result = schema.safeParse([{ ...baseItem, pattern: 'dog' }]);

    expect(result.success).toBe(true);
  });

  it('rejects a pattern wrapped in a leading and trailing forward slash', () => {
    const result = schema.safeParse([{ ...baseItem, pattern: '/dog/' }]);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'The RegExp constructor cannot take a string pattern with a leading and/or trailing forward slash.',
    );
  });

  it('rejects a pattern with only a trailing forward slash', () => {
    const result = schema.safeParse([{ ...baseItem, pattern: 'dog/' }]);

    expect(result.success).toBe(false);
  });
});
