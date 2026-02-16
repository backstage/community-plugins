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

// These translation files are not exported by the package, so relative imports are necessary for e2e tests
/* eslint-disable @backstage/no-relative-monorepo-imports */
import { servicenowMessages } from '../../src/translations/ref.js';
import servicenowDe from '../../src/translations/de.js';
import servicenowFr from '../../src/translations/fr.js';
import servicenowEs from '../../src/translations/es.js';
import servicenowIt from '../../src/translations/it.js';
import servicenowJa from '../../src/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type ServicenowMessages = typeof servicenowMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): ServicenowMessages {
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

  return result as ServicenowMessages;
}

export function getTranslations(locale: string): ServicenowMessages {
  switch (locale) {
    case 'en':
      return servicenowMessages;
    case 'fr':
      return transform(servicenowFr.messages);
    case 'de':
      return transform(servicenowDe.messages);
    case 'es':
      return transform(servicenowEs.messages);
    case 'it':
      return transform(servicenowIt.messages);
    case 'ja':
      return transform(servicenowJa.messages);
    default:
      return servicenowMessages;
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
