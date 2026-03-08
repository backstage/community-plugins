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
 * Agentic Chat Theme System
 *
 * Exports:
 * - tokens: Design tokens (spacing, colors, typography)
 * - styles: Style utility functions (glass effects, scrollbars, etc.)
 * - components: Component-specific style factories
 * - branding: Branding utilities and default config
 */

export * from './tokens';
export * from './styles';
export * from './components';
export * from './branding';
export {
  getSharedMarkdownSx,
  surfaceOverlay,
  subtleBorder,
  codeBlockBackground,
} from './markdown';
