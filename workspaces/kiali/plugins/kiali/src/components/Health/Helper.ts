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
import { Status } from '@backstage-community/plugin-kiali-common/types';
import { Icon } from '@patternfly/react-core';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export const createIcon = (status: Status, size?: Size) => {
  const classForColor = kialiStyle({
    color: status.color,
  });
  return React.createElement(
    Icon,
    { size: size, className: `${status.class} ${classForColor}` },
    React.createElement(status.icon),
  );
};
