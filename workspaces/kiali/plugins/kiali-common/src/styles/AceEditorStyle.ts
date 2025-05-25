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
import { NestedCSSProperties } from 'typestyle/lib/types';
import { PFColors } from './PfColors';
import { kialiStyle } from './StyleUtils';

/*
 * 70px is the height of the bottom toolbar (save, reload and cancel buttons)
 * 100px is the top margin of the yaml editor (Adjusted with RenderComponentScroll).
 * So, substracting 170px from the tab content height.
 */
export const istioAceEditorStyle = kialiStyle({
  '--kiali-yaml-editor-height':
    'calc(var(--kiali-details-pages-tab-content-height) - 170px)',
  position: 'relative',
  minHeight: '200px',
  border: `1px solid ${PFColors.BorderColor200}`,
  fontSize: 'var(--kiali-global--font-size) !important',
  $nest: {
    '& div.ace_gutter-cell.ace_info': {
      backgroundImage: 'none',
      $nest: {
        '&::before': {
          content: `'\\E92b'`,
          fontFamily: 'pficon',
          left: '5px',
          position: 'absolute',
        },
      },
    },
  },
} as NestedCSSProperties);

export const istioValidationErrorStyle = kialiStyle({
  position: 'absolute',
  background: 'rgba(204, 0, 0, 0.5)',
});

export const istioValidationWarningStyle = kialiStyle({
  position: 'absolute',
  background: 'rgba(236, 122, 8, 0.5)',
});

export const istioValidationInfoStyle = kialiStyle({
  position: 'absolute',
  background: PFColors.ColorLight300,
});
