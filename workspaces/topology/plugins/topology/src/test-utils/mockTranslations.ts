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
import { topologyMessages } from '../translations/ref';

function flattenMessages(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, flattenMessages(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }
  return flattened;
}

const flattenedMessages = flattenMessages(topologyMessages);

export const mockT = (key: string, params?: any) => {
  let message = flattenedMessages[key] || key;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      message = message.replace(
        new RegExp(`{{${paramKey}}}`, 'g'),
        String(paramValue),
      );
    }
  }
  return message;
};

export const mockUseTranslation = () => ({ t: mockT });

export const mockUseLanguage = () => 'en';

export const MockTrans = ({
  message,
  params,
}: {
  message: string;
  params?: any;
}) => mockT(message, params);

export const MockLocalizedTimestamp = ({ date }: { date?: string | Date }) => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US');
};
