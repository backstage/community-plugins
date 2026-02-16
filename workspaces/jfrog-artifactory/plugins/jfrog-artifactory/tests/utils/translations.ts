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
import { jfrogArtifactoryMessages } from '../../src/translations/ref.js';
import jfrogTranslationDe from '../../src/translations/de.js';
import jfrogTranslationFr from '../../src/translations/fr.js';
import jfrogTranslationEs from '../../src/translations/es.js';
import jfrogTranslationIt from '../../src/translations/it.js';
import jfrogTranslationJa from '../../src/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type JfrogMessages = typeof jfrogArtifactoryMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): JfrogMessages {
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

  return result as JfrogMessages;
}

export function getTranslations(locale: string): JfrogMessages {
  switch (locale) {
    case 'en':
      return jfrogArtifactoryMessages;
    case 'fr':
      return transform(jfrogTranslationFr.messages);
    case 'de':
      return transform(jfrogTranslationDe.messages);
    case 'es':
      return transform(jfrogTranslationEs.messages);
    case 'it':
      return transform(jfrogTranslationIt.messages);
    case 'ja':
      return transform(jfrogTranslationJa.messages);

    default:
      return jfrogArtifactoryMessages;
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
