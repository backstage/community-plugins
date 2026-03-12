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
import { DEFAULT_BRANDING } from '@backstage-community/plugin-agentic-chat-common';
import type { BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';
import type { AdminConfigService } from '../services/AdminConfigService';
import { createWithRoute } from './routeWrapper';
import type { RouteContext } from './types';

/**
 * Registers unauthenticated status and branding endpoints.
 * These are needed for UI bootstrapping and k8s probes.
 */
export function registerStatusRoutes(
  ctx: RouteContext,
  adminConfig?: AdminConfigService,
): void {
  const { router, logger, config, provider, sendRouteError } = ctx;
  const withRoute = createWithRoute(logger, sendRouteError);

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get(
    '/status',
    withRoute('GET /status', 'Failed to get status', async (req, res) => {
      const status = await provider.getStatus();
      const isAdmin = await ctx.checkIsAdmin(req);

      const redacted = {
        ...status,
        providerId: provider.id,
        isAdmin,
        provider: {
          ...status.provider,
          baseUrl: status.provider.connected
            ? '(connected)'
            : '(not connected)',
        },
        mcpServers: status.mcpServers.map(s => ({
          ...s,
          url: s.connected ? '(connected)' : '(not connected)',
        })),
      };
      res.json(redacted);
    }),
  );

  router.get(
    '/branding',
    withRoute(
      'GET /branding',
      'Failed to get branding configuration',
      async (_req, res) => {
        const brandingConfig = config.getOptionalConfig('agenticChat.branding');
        const glassConfigRaw = brandingConfig?.getOptionalConfig('glassConfig');
        const glassConfig = glassConfigRaw
          ? {
              blur: glassConfigRaw.getOptionalNumber('blur'),
              backgroundOpacity:
                glassConfigRaw.getOptionalNumber('backgroundOpacity'),
              borderOpacity: glassConfigRaw.getOptionalNumber('borderOpacity'),
            }
          : undefined;

        const yamlOverrides: Partial<BrandingConfig> = {};
        if (brandingConfig) {
          const str = (k: string) => brandingConfig.getOptionalString(k);
          const bool = (k: string) => brandingConfig.getOptionalBoolean(k);

          const appName = str('appName');
          if (appName) yamlOverrides.appName = appName;
          const tagline = str('tagline');
          if (tagline) yamlOverrides.tagline = tagline;
          const inputPlaceholder = str('inputPlaceholder');
          if (inputPlaceholder)
            yamlOverrides.inputPlaceholder = inputPlaceholder;
          const primaryColor = str('primaryColor');
          if (primaryColor) yamlOverrides.primaryColor = primaryColor;
          const secondaryColor = str('secondaryColor');
          if (secondaryColor) yamlOverrides.secondaryColor = secondaryColor;
          const successColor = str('successColor');
          if (successColor) yamlOverrides.successColor = successColor;
          const warningColor = str('warningColor');
          if (warningColor) yamlOverrides.warningColor = warningColor;
          const errorColor = str('errorColor');
          if (errorColor) yamlOverrides.errorColor = errorColor;
          const infoColor = str('infoColor');
          if (infoColor) yamlOverrides.infoColor = infoColor;
          const logoUrl = str('logoUrl');
          if (logoUrl) yamlOverrides.logoUrl = logoUrl;
          const faviconUrl = str('faviconUrl');
          if (faviconUrl) yamlOverrides.faviconUrl = faviconUrl;
          const fontFamily = str('fontFamily');
          if (fontFamily) yamlOverrides.fontFamily = fontFamily;
          const fontFamilyMono = str('fontFamilyMono');
          if (fontFamilyMono) yamlOverrides.fontFamilyMono = fontFamilyMono;
          const enableGlassEffect = bool('enableGlassEffect');
          if (enableGlassEffect !== undefined)
            yamlOverrides.enableGlassEffect = enableGlassEffect;
          const themePreset = str('themePreset');
          if (themePreset) yamlOverrides.themePreset = themePreset;
          if (str('glassIntensity'))
            yamlOverrides.glassIntensity = str(
              'glassIntensity',
            ) as BrandingConfig['glassIntensity'];
          if (glassConfig) yamlOverrides.glassConfig = glassConfig;
        }

        const yamlBranding: BrandingConfig = {
          ...DEFAULT_BRANDING,
          ...yamlOverrides,
        };

        let branding: BrandingConfig = yamlBranding;
        if (adminConfig) {
          try {
            const dbBranding = await adminConfig.get('branding');
            if (
              dbBranding &&
              typeof dbBranding === 'object' &&
              !Array.isArray(dbBranding)
            ) {
              branding = {
                ...yamlBranding,
                ...(dbBranding as Partial<BrandingConfig>),
              };
            }
          } catch (err) {
            logger.warn(
              `Failed to read branding overrides from DB, using YAML only: ${
                err instanceof Error ? err.message : 'Unknown error'
              }`,
            );
          }
        }

        res.json({
          success: true,
          branding,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
