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
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useIconStyles = makeStyles<Theme>(theme =>
  createStyles({
    icon: {
      height: '0.8em',
      width: '0.8em',
      top: '0.125em',
      position: 'relative',
      marginRight: theme.spacing(0.6),
      flexShrink: 0,
    },
    bsIcon: {
      marginLeft: theme.spacing(0.6),
      marginBottom: '7px',
      marginRight: '8px',
      width: '0.8em',
    },
    iconOnly: {
      marginLeft: theme.spacing(0.6),
      height: '0.8em',
      width: '0.8em',
      top: '0',
      position: 'relative',
      flexShrink: 0,
    },
    'icon-spin': {
      animation: '$spin-animation 0.5s infinite',
      display: 'inline-block',
    },

    '@keyframes spin-animation': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(359deg)',
      },
    },
  }),
);

export default useIconStyles;
