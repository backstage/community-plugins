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
import { nexusRepositoryManagerMessages } from '../../src/translations/ref.js';
import nexusTranslationDe from '../../src/translations/de.js';
import nexusTranslationFr from '../../src/translations/fr.js';
import nexusTranslationEs from '../../src/translations/es.js';
import nexusTranslationIt from '../../src/translations/it.js';
import nexusTranslationJa from '../../src/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type NexusMessages = typeof nexusRepositoryManagerMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): NexusMessages {
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

  return result as NexusMessages;
}

export function getTranslations(locale: string): NexusMessages {
  switch (locale) {
    case 'en':
      return nexusRepositoryManagerMessages;
    case 'fr':
      return transform(nexusTranslationFr.messages);
    case 'de':
      return transform(nexusTranslationDe.messages);
    case 'es':
      return transform(nexusTranslationEs.messages);
    case 'it':
      return transform(nexusTranslationIt.messages);
    case 'ja':
      return transform(nexusTranslationJa.messages);
    default:
      return nexusRepositoryManagerMessages;
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
