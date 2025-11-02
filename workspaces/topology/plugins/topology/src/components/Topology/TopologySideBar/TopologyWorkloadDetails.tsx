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

import { V1OwnerReference } from '@kubernetes/client-node';
import { LocalizedTimestamp } from '../../LocalizedTimestamp';

import { K8sWorkloadResource } from '../../../types/types';
import { useTranslation } from '../../../hooks/useTranslation';
import TopologyResourceLabels from './TopologyResourceLabels';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';

const TopologyWorkloadDetails = ({
  resource,
  children,
}: PropsWithChildren<{ resource: K8sWorkloadResource }>) => {
  const { t } = useTranslation();

  return (
    <dl style={{ maxWidth: '100%' }}>
      <TopologySideBarDetailsItem label={t('details.name')}>
        {resource.metadata?.name}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem label={t('details.namespace')}>
        {resource.metadata?.namespace}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label={t('details.labels')}
        emptyText={t('details.noLabels')}
      >
        {resource.metadata?.labels && (
          <TopologyResourceLabels
            labels={resource.metadata.labels}
            dataTest="label-list"
          />
        )}
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label={t('details.annotations')}
        emptyText={t('details.noAnnotations')}
      >
        {resource.metadata?.annotations && (
          <TopologyResourceLabels
            labels={resource.metadata.annotations}
            dataTest="annotation-list"
          />
        )}
      </TopologySideBarDetailsItem>
      {children}
      <TopologySideBarDetailsItem label={t('details.createdAt')}>
        <LocalizedTimestamp
          date={resource.metadata?.creationTimestamp}
          dateStyle="medium"
          timeStyle="short"
        />
      </TopologySideBarDetailsItem>
      <TopologySideBarDetailsItem
        label={t('common.owner')}
        emptyText={t('details.noOwner')}
      >
        {resource.metadata?.ownerReferences && (
          <ul data-testid="owner-list">
            <div>
              {(resource.metadata.ownerReferences ?? []).map(
                (o: V1OwnerReference) => (
                  <li key={o.uid}>{o.name}</li>
                ),
              )}
            </div>
          </ul>
        )}
      </TopologySideBarDetailsItem>
    </dl>
  );
};

export default TopologyWorkloadDetails;
