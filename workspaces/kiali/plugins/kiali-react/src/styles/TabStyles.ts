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
import { style } from 'typestyle';
import { PFColors } from '../components/Pf/PfColors';

export const basicTabStyle = style({
  $nest: {
    '& .pf-v5-c-tabs__list': {
      marginLeft: '20px',
    },

    '& .pf-v5-c-tab-content': {
      overflowY: 'auto',
      height: '600px',
    },
  },
});

export const traceTabStyle = style({
  $nest: {
    '& .pf-v5-c-tabs__list': {
      backgroundColor: PFColors.BackgroundColor100,
      borderBottom: `1px solid ${PFColors.BorderColor100}`,
    },
  },
});
