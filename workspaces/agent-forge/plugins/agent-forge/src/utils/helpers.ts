/*
 * Copyright 2025 The Backstage Authors
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

export function makeLinksClickable(text: string): string {
  // Check if the text already contains an anchor tag
  if (text.includes('<a ')) {
    return text; // If it does, return the text as is
  }
  const urlPattern = /(\bhttps?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const isProviderField = (fieldName: string): boolean => {
  return (
    fieldName.toLocaleLowerCase() === 'provider' ||
    fieldName.toLocaleLowerCase() === 'provider name'
  );
};

export const isModelField = (fieldName: string): boolean => {
  return (
    fieldName.toLocaleLowerCase() === 'model' ||
    fieldName.toLocaleLowerCase() === 'model name'
  );
};
