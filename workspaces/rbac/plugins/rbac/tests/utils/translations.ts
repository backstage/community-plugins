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
import { rbacMessages } from '../../src/alpha/translations/ref.js';
import rbacTranslationDe from '../../src/alpha/translations/de.js';
import rbacTranslationFr from '../../src/alpha/translations/fr.js';
import rbacTranslationEs from '../../src/alpha/translations/es.js';
import rbacTranslationIt from '../../src/alpha/translations/it.js';
import rbacTranslationJa from '../../src/alpha/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type RbacMessages = typeof rbacMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): RbacMessages {
  const result = Object.keys(messages).reduce(
    (res, key) => {
      const path = key.split('.');
      const lastIndex = path.length - 1;
      path.reduce((acc: Record<string, unknown>, currentPath, i) => {
        acc[currentPath] =
          lastIndex === i ? messages[key] : acc[currentPath] || {};
        return acc[currentPath] as Record<string, unknown>;
      }, res);
      return res;
    },
    {} as Record<string, unknown>,
  );

  return result as RbacMessages;
}

export function getTranslations(locale: string): RbacMessages {
  switch (locale) {
    case 'en':
      return rbacMessages;
    case 'fr':
      return transform(rbacTranslationFr.messages);
    case 'de':
      return transform(rbacTranslationDe.messages);
    case 'es':
      return transform(rbacTranslationEs.messages);
    case 'it':
      return transform(rbacTranslationIt.messages);
    case 'ja':
      return transform(rbacTranslationJa.messages);
    default:
      return rbacMessages;
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
