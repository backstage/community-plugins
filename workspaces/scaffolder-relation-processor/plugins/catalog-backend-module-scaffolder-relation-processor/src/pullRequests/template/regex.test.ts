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

describe('regex patterns', () => {
  describe('TEMPLATE_VARIABLE_REGEX', () => {
    it('should match template variables', () => {
      expect(TEMPLATE_VARIABLE_REGEX.test('${{ values.name }}')).toBe(true);
      expect(TEMPLATE_VARIABLE_REGEX.test('name: ${{ values.name }}')).toBe(
        true,
      );
      expect(TEMPLATE_VARIABLE_REGEX.test('# ${{ values.description }}')).toBe(
        true,
      );
    });

    it('should not match non-template strings', () => {
      expect(TEMPLATE_VARIABLE_REGEX.test('name: my-component')).toBe(false);
      expect(TEMPLATE_VARIABLE_REGEX.test('description: A test')).toBe(false);
    });
  });

  describe('KEY_VALUE_EXTRACTION_REGEX', () => {
    it('should extract keys from key: value pairs', () => {
      expect('name: my-component'.match(KEY_VALUE_EXTRACTION_REGEX)?.[1]).toBe(
        'name',
      );
      expect('description: test'.match(KEY_VALUE_EXTRACTION_REGEX)?.[1]).toBe(
        'description',
      );
      expect(
        'owner: user:default/guest'.match(KEY_VALUE_EXTRACTION_REGEX)?.[1],
      ).toBe('owner');
    });

    it('should handle keys with quotes', () => {
      expect('"name": "value"'.match(KEY_VALUE_EXTRACTION_REGEX)?.[1]).toBe(
        '"name"',
      );
      expect("'name': 'value'".match(KEY_VALUE_EXTRACTION_REGEX)?.[1]).toBe(
        "'name'",
      );
    });

    it('should not match lines without colons', () => {
      expect('just some text'.match(KEY_VALUE_EXTRACTION_REGEX)).toBeNull();
      expect('# comment line'.match(KEY_VALUE_EXTRACTION_REGEX)).toBeNull();
    });
  });

  describe('JINJA2_CONDITIONAL_REGEX', () => {
    it('should match if statements', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('{% if something %}')).toBe(true);
      expect(JINJA2_CONDITIONAL_REGEX.test('{%- if something %}')).toBe(true);
      expect(JINJA2_CONDITIONAL_REGEX.test('{% if values.useDatabase %}')).toBe(
        true,
      );
    });

    it('should match endif statements', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('{% endif %}')).toBe(true);
      expect(JINJA2_CONDITIONAL_REGEX.test('{%- endif %}')).toBe(true);
    });

    it('should match elif and else statements', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('{% elif something %}')).toBe(true);
      expect(JINJA2_CONDITIONAL_REGEX.test('{% else %}')).toBe(true);
    });

    it('should match for loops', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('{% for item in items %}')).toBe(
        true,
      );
      expect(JINJA2_CONDITIONAL_REGEX.test('{% endfor %}')).toBe(true);
    });

    it('should match block statements', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('{% block content %}')).toBe(true);
      expect(JINJA2_CONDITIONAL_REGEX.test('{% endblock %}')).toBe(true);
    });

    it('should not match regular text or YAML', () => {
      expect(JINJA2_CONDITIONAL_REGEX.test('name: my-component')).toBe(false);
      expect(JINJA2_CONDITIONAL_REGEX.test('description: test')).toBe(false);
      expect(JINJA2_CONDITIONAL_REGEX.test('${{ values.name }}')).toBe(false);
    });
  });
});
