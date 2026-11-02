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

import {
  assertValidLabelSelector,
  validateLabelSelector,
} from './labelSelector';

describe('validateLabelSelector', () => {
  it('accepts simple equality selectors', () => {
    expect(validateLabelSelector('app=my-service')).toBeUndefined();
    expect(validateLabelSelector('app==my-service')).toBeUndefined();
    expect(validateLabelSelector('app!=my-service')).toBeUndefined();
  });

  it('accepts set-based selectors', () => {
    expect(validateLabelSelector('env in (prod,staging)')).toBeUndefined();
    expect(validateLabelSelector('env notin (dev,test)')).toBeUndefined();
  });

  it('accepts existence selectors', () => {
    expect(validateLabelSelector('app')).toBeUndefined();
    expect(validateLabelSelector('!app')).toBeUndefined();
  });

  it('accepts comma-separated selectors', () => {
    expect(validateLabelSelector('app=my-service,env=prod')).toBeUndefined();
    expect(
      validateLabelSelector('app=my-service,env in (prod,staging)'),
    ).toBeUndefined();
  });

  it('accepts selectors with DNS prefix keys', () => {
    expect(
      validateLabelSelector('app.kubernetes.io/name=my-service'),
    ).toBeUndefined();
  });

  it('rejects empty selectors', () => {
    expect(validateLabelSelector('')).toBeDefined();
    expect(validateLabelSelector('   ')).toBeDefined();
  });

  it('rejects invalid selectors', () => {
    expect(validateLabelSelector('=value')).toBeDefined();
    expect(validateLabelSelector('app=my-service,')).toBeDefined();
  });

  it('accepts selectors with an empty label value', () => {
    expect(validateLabelSelector('key=')).toBeUndefined();
    expect(validateLabelSelector('key==')).toBeUndefined();
    expect(validateLabelSelector('key!=')).toBeUndefined();
  });

  it('accepts set-based selectors with an empty value set', () => {
    expect(validateLabelSelector('key in ()')).toBeUndefined();
  });

  it('does not treat commas inside a value set as expression separators', () => {
    // A naive split on ',' would break `(prod,staging)` into two fragments and
    // reject an otherwise valid selector.
    expect(
      validateLabelSelector('env in (prod,staging),app=web'),
    ).toBeUndefined();
  });

  it('names every invalid expression in the message', () => {
    const reason = validateLabelSelector('app=web,=bad,!!worse');

    expect(reason).toContain('"=bad"');
    expect(reason).toContain('"!!worse"');
    expect(reason).not.toContain('"app=web"');
  });
});

describe('assertValidLabelSelector', () => {
  it('returns without throwing for a valid selector', () => {
    expect(() => assertValidLabelSelector('app=web')).not.toThrow();
  });

  it('throws an InputError describing the problem', () => {
    expect(() => assertValidLabelSelector('app=web,')).toThrow(
      /Invalid label selector.*comma/,
    );
  });
});
