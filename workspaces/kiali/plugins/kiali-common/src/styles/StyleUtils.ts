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
import type { Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { style } from 'typestyle';
import { NestedCSSProperties } from 'typestyle/lib/types';

const cssPrefix = process.env.CSS_PREFIX ?? 'kiali';

export const cardsHeight = '300px';
/**
 * Add prefix to CSS classname (mandatory in some plugins like OSSMC)
 * Default prefix value is kiali if the environment variable CSS_PREFIX is not defined
 */
export const kialiStyle = (styleProps: NestedCSSProperties) => {
  return style({
    $debugName: cssPrefix,
    ...styleProps,
  });
};

export const baseStyle = kialiStyle({
  display: 'contents',
  overflow: 'visible',
});

export const linkStyle = kialiStyle({
  color: '#06c',
  cursor: 'pointer',
});

export const useLinkStyle = () => {
  const theme = useTheme();

  return kialiStyle({
    color: theme.palette.type === 'dark' ? '#9CC9FF' : '#06c',
    cursor: 'pointer',
  });
};

export const getChipStyle = (theme: Theme) => {
  return {
    backgroundColor: theme.palette.type === 'dark' ? '#3d5061' : '#e7f1fa',
  };
};
