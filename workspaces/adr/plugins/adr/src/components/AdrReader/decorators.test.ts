/*
 * Copyright 2022 The Backstage Authors
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
import { adrDecoratorFactories } from './decorators';

describe('adrDecoratorFactories', () => {
  describe('createFrontMatterFormatterDecorator', () => {
    const decorator =
      adrDecoratorFactories.createFrontMatterFormatterDecorator();
    const baseUrl = 'http://example.com';

    it('renders structured MADR 4 links (objects with target and kind) as human-readable text', () => {
      const content = `---
title: My ADR
links:
  - target: 31
    kind: Extends
  - target: 50
    kind: "Superseded by"
---
# My ADR
`;
      const result = decorator({ baseUrl, content });
      expect(result.content).toContain('Extends 31');
      expect(result.content).toContain('Superseded by 50');
      expect(result.content).not.toContain('[object Object]');
    });

    it('renders arrays of primitive values joined by commas', () => {
      const content = `---
title: My ADR
tags:
  - backend
  - typescript
---
# My ADR
`;
      const result = decorator({ baseUrl, content });
      expect(result.content).toContain('backend, typescript');
    });

    it('renders generic objects as JSON', () => {
      const content = `---
title: My ADR
meta:
  author: Jane
---
# My ADR
`;
      const result = decorator({ baseUrl, content });
      expect(result.content).toContain('{"author":"Jane"}');
      expect(result.content).not.toContain('[object Object]');
    });

    it('renders strings with newlines replaced by <br/>', () => {
      const content = `---
title: My ADR
description: |-
  line1
  line2
---
# My ADR
`;
      const result = decorator({ baseUrl, content });
      expect(result.content).toContain('line1<br/>line2');
    });

    it('returns content unchanged when no front matter is present', () => {
      const content = '# My ADR\n\nSome content.';
      const result = decorator({ baseUrl, content });
      expect(result.content).toBe(content);
    });
  });
});
