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
import { makeStyles } from '@mui/styles';

const useHeaderStyles = makeStyles(_ => ({
  chatHeaderTitle: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconButton: {
    border: 'none',
    margin: 0,
    padding: 0,
    width: 'auto',
    overflow: 'visible',

    background: 'transparent',

    /* inherit font & color from ancestor */
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    //
    // /* Corrects font smoothing for webkit */
    // -webkit-font-smoothing: inherit;
    // -moz-osx-font-smoothing: inherit;
    //
    // /* Corrects inability to style clickable `input` types in iOS */
    // -webkit-appearance: none;
  },
}));

export { useHeaderStyles };
