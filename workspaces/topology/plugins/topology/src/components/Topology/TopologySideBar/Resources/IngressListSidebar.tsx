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
import { IngressModel } from '../../../../models';
import { IngressData } from '../../../../types/ingresses';
import { useTranslation } from '../../../../hooks/useTranslation';
import TopologyResourcesTabPanelItem from '../TopologyResourcesTabPaneltem';
import IngressRules from './IngressRules';

const IngressListSidebar = ({
  ingressesData,
}: {
  ingressesData: IngressData[];
}) => {
  const { t } = useTranslation();
  return (
    <TopologyResourcesTabPanelItem
      resourceLabel={IngressModel.labelPlural}
      dataTest="ingress-list"
    >
      {ingressesData?.length > 0 &&
        ingressesData.map((ingressData: IngressData) => (
          <li
            className="item"
            style={{ flexDirection: 'column' }}
            key={ingressData.ingress.metadata?.uid}
          >
            <span>
              <ResourceName
                name={ingressData.ingress.metadata?.name ?? ''}
                kind={ingressData.ingress.kind ?? ''}
              />
            </span>
            {ingressData.url && (
              <>
                <span className="bs-topology-text-muted">
                  {t('common.location')}:
                </span>
                <a
                  href={ingressData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ingressData.url}
                </a>
              </>
            )}
            {ingressData.ingress.spec?.rules?.length && (
              <IngressRules ingress={ingressData.ingress} />
            )}
          </li>
        ))}
    </TopologyResourcesTabPanelItem>
  );
};

export default IngressListSidebar;
