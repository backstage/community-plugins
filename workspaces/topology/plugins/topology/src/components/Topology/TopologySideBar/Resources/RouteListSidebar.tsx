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

import ResourceName from '../../../common/ResourceName';
import { RouteModel } from '../../../../models';
import { RouteData } from '../../../../types/route';
import { useTranslation } from '../../../../hooks/useTranslation';
import TopologyResourcesTabPanelItem from '../TopologyResourcesTabPaneltem';

const RouteListSidebar = ({ routesData }: { routesData: RouteData[] }) => {
  const { t } = useTranslation();
  return (
    <TopologyResourcesTabPanelItem
      resourceLabel={RouteModel.labelPlural}
      dataTest="routes-list"
    >
      {routesData?.length > 0 &&
        routesData.map((routeData: RouteData) => (
          <li
            className="item"
            style={{ flexDirection: 'column' }}
            key={routeData.route.metadata?.uid}
          >
            <span>
              <ResourceName
                name={routeData.route.metadata?.name ?? ''}
                kind={routeData.route.kind ?? ''}
              />
            </span>
            {routeData.url && (
              <>
                <span className="bs-topology-text-muted">
                  {t('common.location')}:
                </span>
                <a
                  href={routeData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {routeData.url}
                </a>
              </>
            )}
          </li>
        ))}
    </TopologyResourcesTabPanelItem>
  );
};

export default RouteListSidebar;
