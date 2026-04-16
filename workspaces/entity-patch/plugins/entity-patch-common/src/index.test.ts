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
import { flattenMapping, isMappingTemplate } from './index';

describe('isMappingTemplate', () => {
  it('returns true for values containing {{', () => {
    expect(isMappingTemplate('{{ fieldName }}')).toBe(true);
    expect(isMappingTemplate('https://example.com/{{ path }}')).toBe(true);
  });

  it('returns false for plain field names', () => {
    expect(isMappingTemplate('description')).toBe(false);
    expect(isMappingTemplate('metadata.title')).toBe(false);
    expect(isMappingTemplate('')).toBe(false);
  });
});

describe('flattenMapping', () => {
  it('returns flat dot-notation keys unchanged', () => {
    expect(
      flattenMapping({
        'metadata.title': 'name',
        'metadata.description': 'description',
      }),
    ).toEqual({
      'metadata.title': 'name',
      'metadata.description': 'description',
    });
  });

  it('flattens one level of nesting', () => {
    expect(
      flattenMapping({
        metadata: { title: 'name', description: 'description' } as any,
      }),
    ).toEqual({
      'metadata.title': 'name',
      'metadata.description': 'description',
    });
  });

  it('flattens multiple levels of nesting', () => {
    expect(
      flattenMapping({
        metadata: {
          annotations: { 'slack/channel': 'slackChannel' },
        } as any,
      }),
    ).toEqual({ 'metadata.annotations.slack/channel': 'slackChannel' });
  });

  it('handles mixed flat and nested keys', () => {
    expect(
      flattenMapping({
        'spec.lifecycle': 'lifecycle',
        metadata: { title: 'name' } as any,
      }),
    ).toEqual({
      'spec.lifecycle': 'lifecycle',
      'metadata.title': 'name',
    });
  });

  it('ignores non-string leaf values', () => {
    expect(
      flattenMapping({
        metadata: { count: 42 } as any,
        'spec.type': 'kind',
      }),
    ).toEqual({ 'spec.type': 'kind' });
  });

  it('handles template strings as leaf values', () => {
    expect(
      flattenMapping({
        'metadata.annotations.runbook':
          'https://wiki.example.com/runbooks/{{ service }}',
      }),
    ).toEqual({
      'metadata.annotations.runbook':
        'https://wiki.example.com/runbooks/{{ service }}',
    });
  });

  it('returns empty object for empty input', () => {
    expect(flattenMapping({})).toEqual({});
  });
});
