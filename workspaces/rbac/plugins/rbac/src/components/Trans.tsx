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

import { isValidElement, Fragment } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { rbacTranslationRef } from '../translations';

type Messages = typeof rbacTranslationRef.T;

interface TransProps<TMessages extends { [key in string]: string }> {
  message: keyof TMessages;
  params?: any;
}

export const Trans = ({ message, params }: TransProps<Messages>) => {
  const { t } = useTranslation();
  const translatedMessage = t(message, params);

  if (params?.link && isValidElement(params.link)) {
    // Replace <link>...</link> in the string with the provided JSX
    const parts = translatedMessage.split(/(<link>[^<]*<\/link>)/);

    return (
      <>
        {parts.map((part, index) => {
          const match = part.match(/^<link>([^<]*)<\/link>$/);
          if (match) {
            // Replace <link> placeholder with JSX from params
            return <Fragment key={index}>{params.link}</Fragment>;
          }
          return part;
        })}
      </>
    );
  }

  return translatedMessage;
};
