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
import { createTranslationRef } from '@backstage/frontend-plugin-api';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { GuidedTourBlueprint, guidedTourDataRef } from './blueprint';
import { translated } from './types';

const testTranslationRef = createTranslationRef({
  id: 'test',
  messages: {
    tour: { title: 'Tour', description: 'About the tour' },
    intro: { title: 'Hello', content: 'World' },
  },
});

describe('GuidedTourBlueprint', () => {
  it('derives the tour id from the extension id', () => {
    const tour = GuidedTourBlueprint.make({
      name: 'intro',
      params: {
        title: 'Intro',
        steps: [{ id: 'a', content: 'hi' }],
      },
    });
    const tester = createExtensionTester(tour);
    expect(tester.get(guidedTourDataRef)).toMatchObject({
      id: 'intro',
      title: 'Intro',
    });
  });

  it('keeps an explicit id', () => {
    const tour = GuidedTourBlueprint.make({
      name: 'intro',
      params: { id: 'custom', title: 'Intro', steps: [] },
    });
    expect(createExtensionTester(tour).get(guidedTourDataRef).id).toBe(
      'custom',
    );
  });

  it('accepts lazily loaded element content', () => {
    const tour = GuidedTourBlueprint.make({
      name: 'lazy',
      params: {
        title: 'Lazy',
        steps: [
          {
            id: 'a',
            content: { loader: async () => <strong>loaded</strong> },
          },
        ],
      },
    });
    const step = createExtensionTester(tour).get(guidedTourDataRef).steps[0];
    expect(typeof (step.content as { loader: unknown }).loader).toBe(
      'function',
    );
  });

  it('accepts translated texts created with translated()', () => {
    const tour = GuidedTourBlueprint.make({
      name: 'translated',
      params: {
        title: translated(testTranslationRef, 'tour.title'),
        description: translated(testTranslationRef, 'tour.description'),
        steps: [
          {
            id: 'a',
            title: translated(testTranslationRef, 'intro.title'),
            content: translated(testTranslationRef, 'intro.content'),
          },
        ],
      },
    });
    const data = createExtensionTester(tour).get(guidedTourDataRef);
    expect(data.title).toMatchObject({ key: 'tour.title' });
    expect(data.steps[0]).toMatchObject({ title: { key: 'intro.title' } });
  });

  it('rejects unknown keys and plain objects at compile time', () => {
    // @ts-expect-error the key is not part of the translation ref
    const wrong = translated(testTranslationRef, 'intro.nope');
    // the runtime object is still created; the error is a type error only
    expect(wrong.key).toBe('intro.nope');

    GuidedTourBlueprint.make({
      name: 'raw-object',
      params: {
        title: 'Raw',
        steps: [
          {
            id: 'a',
            // @ts-expect-error a plain object is not a translated text
            content: { translationRef: testTranslationRef, key: 'intro.title' },
          },
        ],
      },
    });
  });
});
