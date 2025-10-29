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
import { V1Deployment } from '@kubernetes/client-node';

import { useTranslation } from '../../../hooks/useTranslation';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

type TopologyDeploymentDetailsProps = { resource: V1Deployment };

const TopologyDeploymentDetails = ({
  resource,
}: TopologyDeploymentDetailsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="topology-workload-details">
        <TopologyWorkloadDetails resource={resource}>
          <TopologySideBarDetailsItem label={t('common.status')}>
            {resource.status?.availableReplicas ===
            resource.status?.updatedReplicas ? (
              t('status.active')
            ) : (
              <div>{t('status.updating')}</div>
            )}
          </TopologySideBarDetailsItem>
        </TopologyWorkloadDetails>
      </div>
      <div
        className="topology-workload-details"
        data-testid="deployment-details"
      >
        <TopologySideBarDetailsItem label={t('details.updateStrategy')}>
          {resource.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label={t('details.maxUnavailable')}>
          {t('details.maxUnavailableDescription', {
            maxUnavailable:
              resource.spec?.strategy?.rollingUpdate?.maxUnavailable ?? 1,
            replicas: resource.spec?.replicas,
          })}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label={t('details.maxSurge')}>
          {t('details.maxSurgeDescription', {
            maxSurge: resource.spec?.strategy?.rollingUpdate?.maxSurge ?? 1,
            replicas: resource.spec?.replicas,
          })}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label={t('details.progressDeadlineSeconds')}
        >
          {resource.spec?.progressDeadlineSeconds
            ? `${resource.spec.progressDeadlineSeconds} ${t('time.seconds')}`
            : t('details.notConfigured')}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label={t('details.minReadySeconds')}>
          {resource.spec?.minReadySeconds
            ? `${resource.spec.minReadySeconds} ${t('time.seconds')}`
            : t('details.notConfigured')}
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyDeploymentDetails;
