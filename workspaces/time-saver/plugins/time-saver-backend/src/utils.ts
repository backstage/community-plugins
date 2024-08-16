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
export function roundNumericValues<T>(obj: T): T {
  const roundValue = (value: number): number => {
    const rounded = Math.round(value * 100) / 100;

    if (Number.isInteger(rounded)) {
      return rounded;
    }
    return parseFloat(rounded.toFixed(2));
  };

  const roundObject = (input: object | unknown): unknown => {
    if (typeof input === 'object' && input !== null) {
      Object.values(input).map((value: unknown) => {
        switch (typeof value) {
          case 'number':
            return roundValue(value);
          case 'object':
            return roundObject(value);
          default:
            return value;
        }
      });
    }
    return input;
  };

  return roundObject(obj) as T;
}
