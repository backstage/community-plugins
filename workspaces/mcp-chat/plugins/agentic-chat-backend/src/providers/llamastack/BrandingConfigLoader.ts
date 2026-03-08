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

import type { Config } from '@backstage/config';
import type { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Load branding overrides from app-config.yaml (agenticChat.branding).
 * Returns only the fields explicitly set in YAML; consumers merge
 * with DEFAULT_BRANDING to get a complete BrandingConfig.
 *
 * @param config - Backstage config (e.g. RootConfigService)
 * @param _logger - Logger (reserved for future use)
 * @returns Partial branding overrides, or empty object if not configured
 */
export function loadBrandingOverrides(
  config: Config,
  _logger: LoggerService,
): Record<string, unknown> {
  const bc = config.getOptionalConfig('agenticChat.branding');
  if (!bc) return {};

  const result: Record<string, unknown> = {};
  const str = (k: string) => bc.getOptionalString(k);
  const bool = (k: string) => bc.getOptionalBoolean(k);

  if (str('appName')) result.appName = str('appName');
  if (str('tagline')) result.tagline = str('tagline');
  if (str('inputPlaceholder'))
    result.inputPlaceholder = str('inputPlaceholder');
  if (str('primaryColor')) result.primaryColor = str('primaryColor');
  if (str('secondaryColor')) result.secondaryColor = str('secondaryColor');
  if (str('successColor')) result.successColor = str('successColor');
  if (str('warningColor')) result.warningColor = str('warningColor');
  if (str('errorColor')) result.errorColor = str('errorColor');
  if (str('infoColor')) result.infoColor = str('infoColor');
  if (str('logoUrl')) result.logoUrl = str('logoUrl');
  if (str('faviconUrl')) result.faviconUrl = str('faviconUrl');
  if (str('fontFamily')) result.fontFamily = str('fontFamily');
  if (str('fontFamilyMono')) result.fontFamilyMono = str('fontFamilyMono');
  if (bool('enableGlassEffect') !== undefined)
    result.enableGlassEffect = bool('enableGlassEffect');
  if (str('themePreset')) result.themePreset = str('themePreset');
  if (str('glassIntensity')) result.glassIntensity = str('glassIntensity');

  const gc = bc.getOptionalConfig('glassConfig');
  if (gc) {
    result.glassConfig = {
      blur: gc.getOptionalNumber('blur'),
      backgroundOpacity: gc.getOptionalNumber('backgroundOpacity'),
      borderOpacity: gc.getOptionalNumber('borderOpacity'),
    };
  }

  return result;
}
