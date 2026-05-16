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

/**
 * Styles for column icons, sets margin to not expand the row height
 *
 * @public
 */
export const useColumnIconStyles = makeStyles(() => ({
  graphics: {
    marginTop: 'calc(0px - var(--bui-space-2))',
    marginBottom: 'calc(0px - var(--bui-space-2))',
  },
  icon: {
    marginTop: 'calc(0px - var(--bui-space-1))',
    marginBottom: 'calc(0px - var(--bui-space-1))',
  },
  noData: {
    opacity: 0.5,
  },
  noIcon: {
    opacity: 0,
  },
}));
