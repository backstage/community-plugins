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
import { PFColors } from '../components/Pf/PfColors';
import { kialiStyle } from './StyleUtils';

export const containerStyle = kialiStyle({
  overflow: 'auto',
});

// this emulates Select component .pf-v5-c-select__menu
export const menuStyle = kialiStyle({
  fontSize: 'var(--kiali-global--font-size)',
});

// this emulates Select component .pf-v5-c-select__menu but w/o cursor manipulation
export const menuEntryStyle = kialiStyle({
  display: 'inline-block',
  width: '100%',
});

// this emulates Select component .pf-v5-c-select__menu-group-title but with less bottom padding to conserve space
export const titleStyle = kialiStyle({
  padding: '0.5rem 1rem 0 1rem',
  fontWeight: 700,
  color: PFColors.Color200,
});

const itemStyle: NestedCSSProperties = {
  alignItems: 'center',
  whiteSpace: 'nowrap',
  margin: 0,
  padding: '0.375rem 1rem',
  display: 'inline-block',
};

// this emulates Select component .pf-v5-c-select__menu-item but with less vertical padding to conserve space
export const itemStyleWithoutInfo = kialiStyle(itemStyle);

// this emulates Select component .pf-v5-c-select__menu-item but with less vertical padding to conserve space
export const itemStyleWithInfo = kialiStyle({
  ...itemStyle,
  padding: '0.375rem 0 0.375rem 1rem',
});

export const infoStyle = kialiStyle({
  marginLeft: '0.375rem',
});

export const groupMenuStyle = kialiStyle({
  textAlign: 'left',
});

export const kebabToggleStyle = kialiStyle({
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
});
