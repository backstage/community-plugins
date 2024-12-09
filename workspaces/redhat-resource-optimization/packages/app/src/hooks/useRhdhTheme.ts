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
import { getThemes } from '@redhat-developer/red-hat-developer-hub-theme';
import LogoFull from '../components/rhdh-logo/RhdhLogoFull';
import RhdhLogoIcon from '../components/rhdh-logo/RhdhLogoIcon';

/**
 * Change this value to `true` if you want to use the RHDH theme.
 */
const ENABLE_RHDH_THEME = false;

export function useRhdhTheme() {
  return ENABLE_RHDH_THEME
    ? ({
        RhdhLogoFull: LogoFull,
        RhdhLogoIcon: RhdhLogoIcon,
        get themes() {
          return getThemes();
        },
      } as const)
    : null;
}
