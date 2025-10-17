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

import { useLanguage } from '../hooks/useLanguage';

interface LocalizedTimestampProps {
  date: string | Date | undefined;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

export const LocalizedTimestamp: React.FC<LocalizedTimestampProps> = ({
  date,
  dateStyle = 'medium',
  timeStyle = 'short',
}) => {
  const language = useLanguage();

  if (!date) {
    return <span>-</span>;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Map language codes to widely supported locale codes
  const getLocale = (lang: string): string => {
    switch (lang) {
      case 'fr':
        return 'fr-FR';
      case 'de':
        return 'de-DE';
      case 'it':
        return 'it-IT';
      case 'es':
        return 'es-ES';
      case 'en':
      default:
        return 'en-US';
    }
  };

  const locale = getLocale(language);

  try {
    return (
      <span>
        {dateObj.toLocaleString(locale, {
          dateStyle,
          timeStyle,
        } as Intl.DateTimeFormatOptions)}
      </span>
    );
  } catch (error) {
    // Fallback to English if locale is not supported
    return (
      <span>
        {dateObj.toLocaleString('en-US', {
          dateStyle,
          timeStyle,
        } as Intl.DateTimeFormatOptions)}
      </span>
    );
  }
};
