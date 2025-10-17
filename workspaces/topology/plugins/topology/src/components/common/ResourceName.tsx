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
import type { ReactNode } from 'react';

import classNames from 'classnames';

import './ResourceName.css';
import { resourceModels } from '../../models';
import { MEMO } from '../../const';
import { kindToAbbr } from '../../utils/getResources';

export type ResourceIconProps = {
  className?: string;
  kind: string;
};

export const ResourceIcon = ({ className, kind }: ResourceIconProps) => {
  // if no kind, return null so an empty icon isn't rendered
  if (!kind) {
    return null;
  }
  const kindObj = resourceModels[kind];
  const kindStr = kindObj?.kind || kind;
  const memoKey = className ? `${kind}/${className}` : kind;
  if (MEMO[memoKey]) {
    return MEMO[memoKey];
  }

  const backgroundColor = kindObj?.color;
  const klass = classNames(
    `bs-topology-resource-icon bs-topology-resource-${kindStr.toLocaleLowerCase(
      'en-US',
    )}`,
    className,
  );
  const iconLabel = kindObj?.abbr || kindToAbbr(kindStr);

  const rendered = (
    <span className={klass} title={kindStr} style={{ backgroundColor }}>
      {iconLabel}
    </span>
  );
  if (kindObj) {
    MEMO[memoKey] = rendered;
  }

  return rendered;
};

export type ResourceNameProps = {
  kind: string;
  name: ReactNode;
  large?: boolean;
};

export const ResourceName = ({ kind, name, large }: ResourceNameProps) => (
  <span className="bs-topology-resource-item">
    <ResourceIcon
      kind={kind}
      className={large ? 'bs-topology-resource-icon--lg' : ''}
    />{' '}
    <span
      className={
        large
          ? 'bs-topology-resource-item__resource-name--lg'
          : 'bs-topology-resource-item__resource-name'
      }
    >
      {name}
    </span>
  </span>
);

export default ResourceName;
