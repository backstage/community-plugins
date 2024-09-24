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
import { createIntl, createIntlCache } from 'react-intl';

// eslint-disable-next-line no-restricted-imports
import messages from '../../locales/data.json';

const locale = window.navigator.language.split(/[-_]/)[0] || 'en';
export const getLocale = () => {
  return locale;
};

const cache = createIntlCache();

const intl = createIntl(
  {
    defaultLocale: 'en',
    locale,
    // eslint-disable-next-line no-console
    onError: console.log,
    messages: messages.en,
  },
  cache,
);

export default intl;
