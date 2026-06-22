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

import { resolve } from 'path';
import fs from 'fs';

import {
  isOpenAPI3_0,
  isSwagger1_2,
  isSwagger2_0,
  OpenAPIMergerAndConverter,
} from './open-api-merger-converter';

function readFixture<T>(fileName: string): T {
  const file = resolve(__dirname, `./../__fixtures__/data/${fileName}.json`);
  const fileContent = fs.readFileSync(file, 'utf8');
  return JSON.parse(fileContent) as T;
}

describe('open-api-merger-converter', () => {
  describe('format detection', () => {
    it('detects OpenAPI 3.0 documents', () => {
      const doc = readFixture<Record<string, unknown>>(
        'input/open-api-3.0-doc',
      );
      expect(isOpenAPI3_0(doc)).toBeTruthy();
      expect(isSwagger2_0(doc)).toBeFalsy();
      expect(isSwagger1_2(doc)).toBeFalsy();
    });

    it('detects Swagger 2.0 documents', () => {
      const doc = readFixture<Record<string, unknown>>('input/swagger-2.0-doc');
      expect(isSwagger2_0(doc)).toBe(true);
      expect(isOpenAPI3_0(doc)).toBeFalsy();
      expect(isSwagger1_2(doc)).toBeFalsy();
    });

    it('detects Swagger 1.2 documents', () => {
      const doc = readFixture<Record<string, unknown>>('input/swagger-1.2-doc');
      expect(isSwagger1_2(doc)).toBe(true);
      expect(isSwagger2_0(doc)).toBeFalsy();
      expect(isOpenAPI3_0(doc)).toBeFalsy();
    });
  });

  describe('OpenAPIMergerAndConverter', () => {
    const converter = new OpenAPIMergerAndConverter();

    it('throws for unsupported API document formats', async () => {
      await expect(
        converter.convertAPIDocToOpenAPI3({ title: 'not-a-spec' }),
      ).rejects.toThrow(
        'Unsupported API document. Plugin supports Swagger 1.2, 2.0, 3.0(Open API 3.0)',
      );
    });

    it('converts swagger 1.2 to swagger 2.0', async () => {
      const swagger1_2 = readFixture<Record<string, unknown>>(
        'input/swagger-1.2-doc',
      );
      const converted = await converter.convertSwagger1_2To2_0(swagger1_2);
      const expected = readFixture<Record<string, unknown>>(
        'output/swagger-1.2-converted-to-swagger-2.0',
      );

      expect(converted).toEqual(expected);
    });
  });
});
