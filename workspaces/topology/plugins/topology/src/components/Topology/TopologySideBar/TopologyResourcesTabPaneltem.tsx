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

import { useTranslation } from '../../../hooks/useTranslation';
import './TopologyResourcesTabPanelItem.css';

type TopologyResourcesTabPanelItemProps = {
  resourceLabel: string;
  dataTest?: string;
  showResCount?: number;
};

const TopologyResourcesTabPanelItem = ({
  resourceLabel,
  children,
  dataTest,
  showResCount,
}: PropsWithChildren<TopologyResourcesTabPanelItemProps>) => {
  const { t } = useTranslation();
  const emptyState = (
    <span className="bs-topology-text-muted">
      {t('resources.noResourcesFound', { resourceType: resourceLabel })}
    </span>
  );
  return (
    <>
      <div className="bs-topology-resources-tab-item-title">
        <h2 className="bs-topology-resources-tab-item-label">
          {resourceLabel}
        </h2>
        {showResCount ? (
          <span className="bs-topology-text-muted" data-testid="res-show-count">
            {t('resources.showingLatest', {
              count: showResCount,
              resourceType: resourceLabel,
            })}
          </span>
        ) : null}
      </div>
      <ul
        className="bs-topology-resources-tab-item-list"
        data-testid={dataTest}
      >
        {children ? children : emptyState}
      </ul>
    </>
  );
};

export default TopologyResourcesTabPanelItem;
