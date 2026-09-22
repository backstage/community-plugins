/*
 * Copyright 2024 The Backstage Authors
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
import { parseMadrWithFrontmatter } from './search';

describe('parseMadrWithFrontmatter', () => {
  it('extracts attributes, status and date from front matter, stripping it from the content', () => {
    const content = [
      '---',
      'status: accepted',
      'date: 2024-01-15',
      '---',
      '# My ADR',
      '',
      'Some content.',
    ].join('\n');

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes).toEqual({
      status: 'accepted',
      date: new Date('2024-01-15T00:00:00.000Z'),
    });
    expect(result.status).toBe('accepted');
    expect(result.date).toBe('2024-01-15');
    expect(result.content).toBe('# My ADR\n\nSome content.');
  });

  it('returns empty attributes and unchanged content when no front matter is present', () => {
    const content = '# My ADR\n\nSome content.';

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes).toEqual({});
    expect(result.status).toBeUndefined();
    expect(result.date).toBeUndefined();
    expect(result.content).toBe(content);
  });

  it('returns empty attributes when the front matter block is empty', () => {
    const content = ['---', '---', '# My ADR', '', 'Some content.'].join('\n');

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes).toEqual({});
    expect(result.status).toBeUndefined();
    expect(result.date).toBeUndefined();
    expect(result.content).toBe('# My ADR\n\nSome content.');
  });

  it('returns empty attributes when the front matter block only contains comments', () => {
    const content = ['---', '# nothing to see here', '---', '# My ADR'].join(
      '\n',
    );

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes).toEqual({});
    expect(result.content).toBe('# My ADR');
  });

  it('resolves timestamps to Date values but leaves YAML 1.1 boolean words as strings', () => {
    const content = [
      '---',
      'date: 2024-01-15T10:20:30Z',
      'flag: yes',
      '---',
      '# My ADR',
    ].join('\n');

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes.date).toBeInstanceOf(Date);
    expect(result.attributes.date).toEqual(
      new Date('2024-01-15T10:20:30.000Z'),
    );
    expect(result.date).toBe('2024-01-15');
    expect(result.attributes.flag).toBe('yes');
  });

  it('throws on invalid YAML front matter', () => {
    const content = ['---', 'status: [unclosed', '---', '# My ADR'].join('\n');

    expect(() => parseMadrWithFrontmatter(content)).toThrow();
  });

  it('does not treat a horizontal rule elsewhere in the body as front matter', () => {
    const content = [
      '# My ADR',
      '',
      'Some content.',
      '',
      '---',
      '',
      'More content below a horizontal rule.',
    ].join('\n');

    const result = parseMadrWithFrontmatter(content);

    expect(result.attributes).toEqual({});
    expect(result.status).toBeUndefined();
    expect(result.date).toBeUndefined();
    expect(result.content).toBe(content);
  });
});
