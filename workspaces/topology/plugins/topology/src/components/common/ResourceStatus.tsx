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
import type { PropsWithChildren } from 'react';

import { Badge } from '@patternfly/react-core';
import classNames from 'classnames';

import './ResourceStatus.css';

type ResourceStatusProps = {
  additionalClassNames?: string;
  badgeAlt?: boolean;
  noStatusBackground?: boolean;
};

/**
 * Component for displaying resource status badge.
 * Use this component to display status of given resource.
 * It accepts child element to be rendered inside the badge.
 * @component ResourceStatus
 * @example
 * ```ts
 * return (
 *  <ResourceStatus additionalClassNames="hidden-xs">
 *    <Status status={resourceStatus} />
 *  </ResourceStatus>
 * )
 * ```
 */
const ResourceStatus = ({
  additionalClassNames,
  badgeAlt,
  children,
  noStatusBackground,
}: PropsWithChildren<ResourceStatusProps>) => {
  return (
    <span
      className={classNames(
        'bs-topology-resource-status',
        additionalClassNames,
      )}
    >
      <Badge
        className={classNames('bs-topology-resource-status__badge', {
          'bs-topology-resource-status__badge--alt': badgeAlt,
          'bs-topology-resource-status--BackgroundColor': noStatusBackground,
        })}
        isRead
        data-test="resource-status"
      >
        {children}
      </Badge>
    </span>
  );
};

export default ResourceStatus;
