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
 * Agentic Chat Design Tokens
 *
 * These tokens define the visual foundation of the plugin.
 * Enterprises can override these values for custom branding.
 */

// =============================================================================
// SPACING SCALE
// =============================================================================

export const spacing = {
  /** 4px */
  xs: 0.5,
  /** 8px */
  sm: 1,
  /** 12px */
  md: 1.5,
  /** 16px */
  lg: 2,
  /** 24px */
  xl: 3,
  /** 32px */
  xxl: 4,
  /** 48px */
  xxxl: 6,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  /** 4px - subtle rounding */
  xs: 0.5,
  /** 8px - cards, buttons */
  sm: 1,
  /** 12px - panels */
  md: 1.5,
  /** 16px - modals */
  lg: 2,
  /** 20px - large cards */
  xl: 2.5,
  /** 24px - hero elements */
  xxl: 3,
  /** 9999px - pills */
  pill: '9999px',
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  /** Subtle elevation */
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  /** Medium elevation */
  md: '0 4px 12px rgba(0,0,0,0.1)',
  /** High elevation */
  lg: '0 8px 24px rgba(0,0,0,0.12)',
  /** Floating elements */
  xl: '0 12px 40px rgba(0,0,0,0.15)',
  /** Glass effect */
  glass: '0 8px 32px rgba(0,0,0,0.08)',
  /** Inset */
  inset: 'inset 0 1px 2px rgba(0,0,0,0.1)',
} as const;

// =============================================================================
// COLORS - Brand Palette
// =============================================================================

export const colors = {
  // Primary brand colors (can be overridden for enterprise branding)
  brand: {
    primary: '#1e40af', // Steel blue - professional, enterprise-grade
    primaryHover: '#2563eb',
    primaryLight: '#3b82f6',
    secondary: '#475569', // Slate - neutral complement
    secondaryHover: '#64748b',
  },

  // Semantic colors
  semantic: {
    success: '#059669', // Emerald 600 - deeper for better contrast
    successLight: '#10b981',
    successBg: 'rgba(5, 150, 105, 0.1)',

    warning: '#d97706', // Amber 600
    warningLight: '#f59e0b',
    warningBg: 'rgba(217, 119, 6, 0.1)',

    error: '#dc2626', // Red 600
    errorLight: '#ef4444',
    errorBg: 'rgba(220, 38, 38, 0.1)',

    info: '#2563eb', // Blue 600
    infoLight: '#3b82f6',
    infoBg: 'rgba(37, 99, 235, 0.1)',
  },

  // Surface colors for elevated panels (replaces glassmorphism)
  surface: {
    background: 'rgba(255, 255, 255, 0.06)',
    backgroundHover: 'rgba(255, 255, 255, 0.09)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderHover: 'rgba(255, 255, 255, 0.18)',
    backgroundLight: 'rgba(0, 0, 0, 0.03)',
    backgroundHoverLight: 'rgba(0, 0, 0, 0.05)',
    borderLight: 'rgba(0, 0, 0, 0.10)',
    borderHoverLight: 'rgba(0, 0, 0, 0.15)',
  },

  // Kept for backward compatibility with createGlassStyles consumers
  glass: {
    background: 'rgba(255, 255, 255, 0.06)',
    backgroundHover: 'rgba(255, 255, 255, 0.09)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderHover: 'rgba(255, 255, 255, 0.18)',
    backgroundLight: 'rgba(0, 0, 0, 0.03)',
    backgroundHoverLight: 'rgba(0, 0, 0, 0.05)',
    borderLight: 'rgba(0, 0, 0, 0.10)',
    borderHoverLight: 'rgba(0, 0, 0, 0.15)',
  },

  // Chat-specific colors
  chat: {
    userBubble: '#f1f5f9', // Slate-100 — subtle, doesn't overpower assistant text
    userBubbleDark: '#334155', // Slate-700
    aiBubble: 'transparent',
    aiBubbleLight: 'transparent',
  },

  // Scrollbar colors
  scrollbar: {
    thumb: 'rgba(100, 116, 139, 0.35)',
    thumbHover: 'rgba(100, 116, 139, 0.55)',
    track: 'rgba(255, 255, 255, 0.05)',
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Monaco", monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.8125rem', // 13px
    md: '0.875rem', // 14px
    lg: '1rem', // 16px
    xl: '1.125rem', // 18px
    xxl: '1.25rem', // 20px
    h1: '1.75rem', // 28px
    h2: '1.375rem', // 22px
    h3: '1.125rem', // 18px
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
  spring: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  sidebar: {
    widthCollapsed: '56px',
    widthExpanded: '340px',
  },
  chat: {
    maxWidth: '1200px',
    inputMaxWidth: '1000px',
  },
  card: {
    width: 340,
    height: 130,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Transitions = typeof transitions;
export type ZIndex = typeof zIndex;
export type Layout = typeof layout;

/**
 * Complete design token configuration
 */
export interface DesignTokens {
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  colors: Colors;
  typography: Typography;
  transitions: Transitions;
  zIndex: ZIndex;
  layout: Layout;
}

/**
 * Default design tokens
 */
export const defaultTokens: DesignTokens = {
  spacing,
  borderRadius,
  shadows,
  colors,
  typography,
  transitions,
  zIndex,
  layout,
};

/**
 * Theme preset interface for createTokensFromPreset
 * Matches the structure from presets/types.ts
 */
interface ThemePresetInput {
  colors?: Partial<Colors>;
  typography?: Partial<Typography>;
  spacing?: Partial<Spacing>;
}

/**
 * Create design tokens from a theme preset
 *
 * @param preset - Theme preset containing color overrides
 * @returns Complete design token configuration with preset colors applied
 *
 * @example
 * ```typescript
 * import { loadPreset } from './presets';
 * const enterprisePreset = loadPreset('enterprise');
 * const tokens = createTokensFromPreset(enterprisePreset);
 * ```
 */
export const createTokensFromPreset = (
  preset: ThemePresetInput,
): DesignTokens => {
  return {
    ...defaultTokens,
    colors: {
      ...defaultTokens.colors,
      ...preset.colors,
    },
    typography: {
      ...defaultTokens.typography,
      ...(preset.typography || {}),
    },
    spacing: {
      ...defaultTokens.spacing,
      ...(preset.spacing || {}),
    },
  };
};

// =============================================================================
// GLASS EFFECT TYPES (kept for styles.ts compatibility)
// =============================================================================

/**
 * Glass effect intensity levels
 */
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

/**
 * Glass effect configuration for glassmorphism styles
 */
export interface GlassConfig {
  /** Intensity preset: subtle (corporate), medium (default), strong (consumer) */
  intensity: GlassIntensity;
  /** Backdrop blur amount in pixels (8-24px) */
  blur: number;
  /** Background opacity (0-1, typically 0.02-0.06) */
  backgroundOpacity: number;
  /** Border opacity (0-1, typically 0.05-0.15) */
  borderOpacity: number;
}
