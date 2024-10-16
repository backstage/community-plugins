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
import React from 'react';

import TopologyIcon from '@mui/icons-material/HubOutlined';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';

import './TopologyEmptyState.css';

type TopologyEmptyStateProps = {
  title?: string;
  description?: string;
};

export const TopologyEmptyState = ({
  title,
  description,
}: TopologyEmptyStateProps) => {
  return (
    <EmptyState
      variant={EmptyStateVariant.full}
      isFullHeight
      className="pf-topology-visualization-surface"
    >
      <EmptyStateHeader
        titleText={title || 'No resources found'}
        icon={
          <EmptyStateIcon
            icon={TopologyIcon}
            className="bs-topology-empty-state"
          />
        }
        headingLevel="h3"
      >
        <EmptyStateBody>{description}</EmptyStateBody>
      </EmptyStateHeader>
    </EmptyState>
  );
};
