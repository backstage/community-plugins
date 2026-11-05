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

import { ConfigReader } from '@backstage/config';
import { readAwsInfrastructureConfigs } from './config';

function readFilters(excludeTags?: object[]) {
  return readAwsInfrastructureConfigs(
    new ConfigReader({
      catalog: {
        providers: {
          awsConfig: {
            default: {
              filters: {
                resourceTypes: ['AWS::DynamoDB::Table'],
                ...(excludeTags ? { excludeTags } : {}),
              },
            },
          },
        },
      },
    }),
  )[0].filters;
}

describe('AWS Config tag exclusion configuration', () => {
  it('preserves defaults and compiles patterns, including an empty pattern', () => {
    expect(readFilters()).toEqual({
      resourceTypes: ['AWS::DynamoDB::Table'],
      tagFilters: [],
      excludeTags: [],
    });
    const filters = readFilters([
      { key: 'Name', valuePattern: 'temporary-\\d+' },
      { key: 'any-value', valuePattern: '' },
      { key: 'empty-value', value: '' },
    ]);
    const [nameFilter, anyValue, emptyValue] = filters.excludeTags!;
    expect(nameFilter.valuePattern).toBeInstanceOf(RegExp);
    expect(nameFilter.valuePattern?.source).toBe('temporary-\\d+');
    expect(nameFilter.valuePattern?.flags).toBe('');
    expect(anyValue.valuePattern?.test('')).toBe(true);
    expect(emptyValue.value).toBe('');
    expect(emptyValue.valuePattern).toBeUndefined();
  });

  it.each([
    [{ value: 'true' }, 'key'],
    [{ key: 'tag', value: true }, 'value'],
    [{ key: 'tag', valuePattern: 123 }, 'valuePattern'],
  ])('requires a key and string match options: %j', (entry, field) => {
    expect(() => readFilters([entry])).toThrow(
      new RegExp(
        `catalog\\.providers\\.awsConfig\\.default\\.filters\\.excludeTags\\[0\\]\\.${field}`,
      ),
    );
  });
});
