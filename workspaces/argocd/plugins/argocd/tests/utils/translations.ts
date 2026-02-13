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
import { argocdMessages } from '../../src/translations/ref.js';
import argocdTranslationFr from '../../src/translations/fr.js';
import argocdTranslationIt from '../../src/translations/it.js';
import argocdTranslationJa from '../../src/translations/ja.js';
/* eslint-enable @backstage/no-relative-monorepo-imports */

export type ArgoCDMessages = typeof argocdMessages;

type FlatMessages = Record<string, string>;

function transform(messages: FlatMessages): ArgoCDMessages {
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

  return result as ArgoCDMessages;
}

/** Normalize BCP 47 locale (e.g. ja-JP) to base language code (e.g. ja) for lookup. */
function toBaseLocale(locale: string): string {
  return locale.split('-')[0];
}

export function getTranslations(locale: string): ArgoCDMessages {
  const base = toBaseLocale(locale);
  switch (base) {
    case 'en':
      return argocdMessages;
    case 'fr':
      return transform(argocdTranslationFr.messages);
    case 'it':
      return transform(argocdTranslationIt.messages);
    case 'ja':
      return transform(argocdTranslationJa.messages);
    default:
      return argocdMessages;
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

/**
 * Convert a translation template to a regex pattern for aria snapshot matching
 * Replaces {{placeholder}} with regex patterns
 */
export function templateToPattern(template: string): string {
  return template.replaceAll(/\{\{[^}]+\}\}/g, '\\d+%?');
}
