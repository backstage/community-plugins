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

/**
 * Branding Utilities
 *
 * Helpers for working with branding configuration.
 * The primary branding hook is in hooks/useBranding.ts which fetches
 * branding from the backend API (app-config.yaml).
 *
 * This file provides:
 * - Default branding values
 * - CSS variable generation utilities
 */

import { typography } from './tokens';
import { type BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';

export type { BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';
export { DEFAULT_BRANDING } from '@backstage-community/plugin-agentic-chat-common';

/**
 * Helper to generate CSS variables from branding config
 * Useful for injecting branding into CSS-based styling
 */
export const brandingToCssVariables = (
  branding: BrandingConfig,
): Record<string, string> => {
  const variables: Record<string, string> = {
    '--te-color-primary': branding.primaryColor,
    '--te-color-secondary': branding.secondaryColor,
    '--te-color-success': branding.successColor,
    '--te-color-warning': branding.warningColor,
    '--te-color-error': branding.errorColor,
    '--te-color-info': branding.infoColor,
    '--te-font-family': branding.fontFamily || typography.fontFamily.primary,
    '--te-font-family-mono':
      branding.fontFamilyMono || typography.fontFamily.mono,
  };

  // Merge custom CSS variables if provided
  if (branding.customCssVariables) {
    Object.assign(variables, branding.customCssVariables);
  }

  return variables;
};

/**
 * Inject branding CSS variables into document root
 * Call this once at app initialization to apply branding globally
 */
export const injectBrandingStyles = (branding: BrandingConfig): void => {
  const variables = brandingToCssVariables(branding);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
