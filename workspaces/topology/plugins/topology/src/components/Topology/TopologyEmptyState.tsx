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
import TopologyIcon from '@mui/icons-material/HubOutlined';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

type TopologyEmptyStateProps = {
  title?: string;
  description?: string;
};

export const TopologyEmptyState = ({
  title,
  description,
}: TopologyEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      variant={EmptyStateVariant.full}
      isFullHeight
      className="pf-topology-visualization-surface"
      titleText={title || t('emptyState.noResourcesFound')}
      icon={TopologyIcon}
      headingLevel="h3"
    >
      <EmptyStateBody>
        {description || t('emptyState.noResourcesDescription')}
      </EmptyStateBody>
    </EmptyState>
  );
};
