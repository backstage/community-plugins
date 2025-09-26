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
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { topologyTranslationRef } from '../translations';

/**
 * Message map type for the Topology plugin translations.
 */
export type Messages = typeof topologyTranslationRef.T;

/**
 * Props for the Trans component.
 */
export interface TransProps<TMessages extends { [key in string]: string }> {
  message: keyof TMessages;
  params?: any;
  components?: Record<string, ComponentType<any>>;
}

/**
 * Render a translated message, optionally replacing placeholders with components.
 */
export const Trans = ({
  message,
  params,
  components,
}: TransProps<Messages>) => {
  const { t } = useTranslation();
  const translatedText = t(message, params);

  if (!components) {
    return translatedText;
  }

  let result: ReactNode = translatedText;

  Object.entries(components).forEach(([key, Component]) => {
    const placeholder = `<${key}>`;
    const closingTag = `</${key}>`;

    if (typeof result === 'string' && result.includes(placeholder)) {
      const parts = result.split(placeholder);
      const newResult: ReactNode[] = [];

      parts.forEach((part, index) => {
        if (index === 0) {
          newResult.push(part);
        } else {
          const [content, ...rest] = part.split(closingTag);
          newResult.push(
            <Component key={`${key}-${index}`}>{content}</Component>,
          );
          if (rest.length > 0) {
            newResult.push(rest.join(closingTag));
          }
        }
      });

      result = newResult;
    }
  });

  return <>{result}</>;
};
