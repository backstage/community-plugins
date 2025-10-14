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
import { V1Pod, V1Service, V1ServicePort } from '@kubernetes/client-node';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { ChartLabel } from '@patternfly/react-charts/victory';
import { BaseNode } from '@patternfly/react-topology';

import { Status } from '../../common/Status';
import ResourceName from '../../common/ResourceName';
import ResourceStatus from '../../common/ResourceStatus';
import { MAXSHOWRESCOUNT } from '../../../const';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  CronJobModel,
  JobModel,
  PodModel,
  ServiceModel,
} from '../../../models';
import { JobData } from '../../../types/jobs';
import { podPhase } from '../../../utils/pod-resource-utils';
import { byCreationTime } from '../../../utils/resource-utils';
import PodStatus from '../../Pods/PodStatus';
import PLRlist from './PLRlist';
import { PodLogsDialog } from './PodLogs/PodLogsDialog';
import IngressListSidebar from './Resources/IngressListSidebar';
import RouteListSidebar from './Resources/RouteListSidebar';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

import './TopologyResourcesTabPanel.css';

type TopologyResourcesTabPanelProps = { node: BaseNode };

const TranslatedStatus = ({
  status,
  translateFn,
}: {
  status: string | null;
  translateFn: (status: string | null) => string;
}) => {
  if (!status) return <>-</>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Status status={status} iconOnly />
      <span>{translateFn(status)}</span>
    </div>
  );
};

const TopologyResourcesTabPanel = ({
  node,
}: TopologyResourcesTabPanelProps) => {
  const { t } = useTranslation();
  const data = node.getData();
  const nodeData = data?.data;

  const translatePodStatus = (status: string | null) => {
    if (!status) return '-';

    switch (status.toLowerCase()) {
      case 'running':
        return t('status.running');
      case 'pending':
        return t('status.pending');
      case 'succeeded':
        return t('status.succeeded');
      case 'failed':
        return t('status.failed');
      case 'unknown':
        return t('status.unknown');
      case 'terminating':
        return t('status.terminating');
      case 'crashloopbackoff':
        return t('status.crashLoopBackOff');
      case 'error':
        return t('status.error');
      case 'warning':
        return t('status.warning');
      case 'completed':
        return t('status.succeeded'); // Kubernetes uses 'Completed' but we map to 'succeeded'
      case 'evicted':
        return t('status.evicted');
      default:
        return status; // fallback to original status if no translation found
    }
  };

  const resource = data?.resource;
  const pipelines = nodeData?.pipelinesData?.pipelines;
  const pipelineRuns = nodeData?.pipelinesData?.pipelineRuns;
  const showIngressRoute = () => {
    const { ingressesData, routesData } = nodeData;
    const hasIngressData = ingressesData?.length > 0;
    const hasRoutesData = routesData?.length > 0;
    if (hasIngressData && hasRoutesData) {
      return (
        <>
          <RouteListSidebar routesData={routesData} />
          <IngressListSidebar ingressesData={ingressesData} />
        </>
      );
    } else if (hasRoutesData && !hasIngressData) {
      return <RouteListSidebar routesData={routesData} />;
    }

    return <IngressListSidebar ingressesData={ingressesData} />;
  };

  return (
    <div data-testid="resources-tab">
      <TopologyResourcesTabPanelItem
        resourceLabel={PodModel.labelPlural}
        showResCount={
          nodeData?.podsData?.pods?.length > MAXSHOWRESCOUNT
            ? MAXSHOWRESCOUNT
            : undefined
        }
        dataTest="pod-list"
      >
        {nodeData?.podsData?.pods?.length &&
          nodeData.podsData.pods
            .sort(byCreationTime)
            .slice(0, MAXSHOWRESCOUNT)
            .map((pod: V1Pod) => {
              const status = podPhase(pod);
              return (
                <li
                  style={{ gap: '10px' }}
                  className="item"
                  key={pod.metadata?.uid}
                >
                  <span style={{ flex: '1' }}>
                    <ResourceName
                      name={pod.metadata?.name ?? ''}
                      kind={pod.kind ?? ''}
                    />
                  </span>
                  <span style={{ flex: '1' }}>
                    {' '}
                    <ResourceStatus
                      additionalClassNames="hidden-xs"
                      noStatusBackground
                    >
                      <TranslatedStatus
                        status={status}
                        translateFn={translatePodStatus}
                      />
                    </ResourceStatus>
                  </span>
                  <span style={{ flex: '1' }}>
                    <PodLogsDialog podData={pod} />
                  </span>
                </li>
              );
            })}
      </TopologyResourcesTabPanelItem>
      {pipelines?.length > 0 ? (
        <PLRlist pipelines={pipelines} pipelineRuns={pipelineRuns} />
      ) : null}
      {resource.kind === CronJobModel.kind ? (
        <TopologyResourcesTabPanelItem
          resourceLabel={JobModel.labelPlural}
          dataTest="job-list"
        >
          {nodeData?.jobsData?.length &&
            nodeData.jobsData.map((jobData: JobData) => (
              <li
                className="item"
                key={jobData.job.metadata?.uid}
                style={{ alignItems: 'center' }}
              >
                <span style={{ flex: '1' }}>
                  <ResourceName
                    name={jobData.job.metadata?.name ?? ''}
                    kind={jobData.job.kind ?? ''}
                  />
                </span>
                <span className="bs-topology-job-pod-ring">
                  <PodStatus
                    standalone
                    data={jobData.podsData.pods}
                    size={25}
                    innerRadius={8}
                    outerRadius={12}
                    title={`${jobData.podsData.pods.length}`}
                    titleComponent={<ChartLabel style={{ fontSize: '10px' }} />}
                    showTooltip={false}
                  />
                </span>
              </li>
            ))}
        </TopologyResourcesTabPanelItem>
      ) : null}
      <TopologyResourcesTabPanelItem
        resourceLabel={ServiceModel.labelPlural}
        dataTest="service-list"
      >
        {nodeData?.services?.length &&
          nodeData.services.map((service: V1Service) => (
            <li
              className="item"
              style={{ flexDirection: 'column' }}
              key={service.metadata?.uid}
            >
              <span>
                <ResourceName
                  name={service.metadata?.name ?? ''}
                  kind={service.kind ?? ''}
                />
              </span>
              <ul>
                {(service.spec?.ports ?? []).map(
                  ({ name, port, protocol, targetPort }: V1ServicePort) => (
                    <li key={name || `${port}-${protocol}`}>
                      <span className="bs-topology-text-muted">
                        Service port:
                      </span>{' '}
                      {name || `${port}-${protocol}`}
                      &nbsp;
                      <ArrowRightAltIcon
                        style={{ width: '0.8em', verticalAlign: '-0.300em' }}
                      />
                      &nbsp;
                      <span className="bs-topology-text-muted">
                        Pod port:
                      </span>{' '}
                      {targetPort}
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
      {showIngressRoute()}
    </div>
  );
};

export default TopologyResourcesTabPanel;
