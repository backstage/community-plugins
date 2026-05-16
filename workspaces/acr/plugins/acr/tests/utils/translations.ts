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

// These translation files are not exported by the package, so relative imports are necessary for e2e tests
/* eslint-disable @backstage/no-relative-monorepo-imports */
import { acrMessages } from '../../src/translations/ref.js';
import acrTranslationDe from '../../src/translations/de.js';
import acrTranslationFr from '../../src/translations/fr.js';
import acrTranslationEs from '../../src/translations/es.js';
import acrTranslationIt from '../../src/translations/it.js';
import acrTranslationJa from '../../src/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type AcrMessages = typeof acrMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): AcrMessages {
  const result = Object.keys(messages).reduce((res, key) => {
    const path = key.split('.');
    const lastIndex = path.length - 1;
    path.reduce((acc: Record<string, unknown>, currentPath, i) => {
      acc[currentPath] =
        lastIndex === i ? messages[key] : acc[currentPath] || {};
      return acc[currentPath] as Record<string, unknown>;
    }, res);
    return res;
  }, {} as Record<string, unknown>);

  return result as AcrMessages;
}

export function getTranslations(locale: string): AcrMessages {
  switch (locale) {
    case 'en':
      return acrMessages;
    case 'fr':
      return transform(acrTranslationFr.messages);
    case 'de':
      return transform(acrTranslationDe.messages);
    case 'es':
      return transform(acrTranslationEs.messages);
    case 'it':
      return transform(acrTranslationIt.messages);
    case 'ja':
      return transform(acrTranslationJa.messages);
    default:
      return acrMessages;
  }
}

/**
 * Replace multiple placeholders in a template string
 * @param template - Template string with placeholders like {{key}}
 * @param replacements - Object with key-value pairs for replacement
 * @returns String with all placeholders replaced
 */
export function replaceTemplate(
  template: string,
  replacements: Record<string, string | number>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, String(value));
  }
  return result;
}
