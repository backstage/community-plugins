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

import { preprocessTemplate } from './variables';

describe('preprocessTemplate', () => {
  it('should replace template variables with scaffolded values', () => {
    const templateContent = `name: \${{ values.name }}
description: \${{ values.description }}
owner: user:default/guest`;

    const scaffoldedContent = `name: my-component
description: My awesome component
owner: user:default/guest`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toBe(scaffoldedContent);
  });

  it('should remove Jinja2 conditional lines', () => {
    const templateContent = `name: \${{ values.name }}
{% if values.useDatabase %}
database: postgres
{% endif %}
description: test`;

    const scaffoldedContent = `name: my-component
database: postgres
description: test`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).not.toContain('{% if');
    expect(result).not.toContain('{% endif %}');
    expect(result).toContain('name: my-component');
    expect(result).toContain('database: postgres');
  });

  it('should keep lines without template variables unchanged', () => {
    const templateContent = `apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: \${{ values.name }}`;

    const scaffoldedContent = `apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-template`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toContain('apiVersion: scaffolder.backstage.io/v1beta3');
    expect(result).toContain('kind: Template');
    expect(result).toContain('metadata:');
    expect(result).toContain('name: my-template');
  });

  it('should handle multiple template variables on same key', () => {
    const templateContent = `name: \${{ values.name }}
owner: \${{ values.owner }}
description: \${{ values.description }}`;

    const scaffoldedContent = `name: component-a
owner: user:default/alice
description: Component A description`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toBe(scaffoldedContent);
  });

  it('should preserve line that contains only template variable', () => {
    const templateContent = `name: test
\${{ values.description }}
owner: guest`;

    const scaffoldedContent = `name: test
This is a description
owner: guest`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toContain('${{ values.description }}');
  });

  it('should preserve template lines with no matching scaffolded keys', () => {
    const templateContent = `name: \${{ values.name }}
newField: \${{ values.newField }}`;

    const scaffoldedContent = `name: my-component
description: test`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toContain('name: my-component');
    expect(result).toContain('newField: ${{ values.newField }}');
  });

  it('should handle empty template content', () => {
    const templateContent = '';
    const scaffoldedContent = 'name: test';

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toBe('');
  });

  it('should handle keys with quotes', () => {
    const templateContent = `"name": "\${{ values.name }}"
'description': '\${{ values.description }}'`;

    const scaffoldedContent = `"name": "my-component"
'description': 'My description'`;

    const result = preprocessTemplate(templateContent, scaffoldedContent);

    expect(result).toContain('"name": "my-component"');
    expect(result).toContain("'description': 'My description'");
  });
});
