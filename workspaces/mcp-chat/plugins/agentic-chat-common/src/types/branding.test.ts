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

import { DEFAULT_BRANDING } from './branding';
import type { BrandingConfig } from './branding';

describe('DEFAULT_BRANDING', () => {
  it('has all required BrandingConfig fields', () => {
    const required: Array<keyof BrandingConfig> = [
      'appName',
      'tagline',
      'inputPlaceholder',
      'primaryColor',
      'secondaryColor',
      'successColor',
      'warningColor',
      'errorColor',
      'infoColor',
    ];
    for (const field of required) {
      expect(DEFAULT_BRANDING[field]).toBeDefined();
    }
  });

  it('has valid hex color values', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    const colorFields: Array<keyof BrandingConfig> = [
      'primaryColor',
      'secondaryColor',
      'successColor',
      'warningColor',
      'errorColor',
      'infoColor',
    ];
    for (const field of colorFields) {
      expect(DEFAULT_BRANDING[field]).toMatch(hexPattern);
    }
  });

  it('has non-empty string fields', () => {
    expect(DEFAULT_BRANDING.appName.length).toBeGreaterThan(0);
    expect(DEFAULT_BRANDING.tagline.length).toBeGreaterThan(0);
    expect(DEFAULT_BRANDING.inputPlaceholder.length).toBeGreaterThan(0);
  });

  it('enables glass effect by default', () => {
    expect(DEFAULT_BRANDING.enableGlassEffect).toBe(true);
  });

  it('uses default theme preset', () => {
    expect(DEFAULT_BRANDING.themePreset).toBe('default');
  });

  it('does not include optional fields that should be undefined', () => {
    expect(DEFAULT_BRANDING.logoUrl).toBeUndefined();
    expect(DEFAULT_BRANDING.faviconUrl).toBeUndefined();
    expect(DEFAULT_BRANDING.fontFamily).toBeUndefined();
    expect(DEFAULT_BRANDING.customCssVariables).toBeUndefined();
  });
});
