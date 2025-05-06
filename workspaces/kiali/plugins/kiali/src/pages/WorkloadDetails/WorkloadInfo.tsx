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
import {
  toIstioItems,
  WorkloadHealth,
} from '@backstage-community/plugin-kiali-common/func';
import type {
  ContainerInfo,
  IstioConfigItem,
  IstioConfigList,
  ObjectCheck,
  ObjectValidation,
  Pod,
  Validations,
  Workload,
} from '@backstage-community/plugin-kiali-common/types';
import {
  DRAWER,
  ENTITY,
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress, Grid } from '@material-ui/core';
import { default as React } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { IstioConfigCard } from '../../components/IstioConfigCard/IstioConfigCard';
import { isIstioNamespace, serverConfig } from '../../config';
import { kialiApiRef } from '../../services/Api';
import { WorkloadPods } from './WorkloadPods';
import { WorkloadDescription } from './WorkloadsDescription';

type WorkloadInfoProps = {
  entity?: boolean;
  duration?: number;
  namespace?: string;
  workload: Workload;
  health?: WorkloadHealth;
  view?: string;
};

export const WorkloadInfo = (workloadProps: WorkloadInfoProps) => {
  const pods = workloadProps.workload.pods || [];
  const namespace = workloadProps.namespace ? workloadProps.namespace : '';
  const kialiClient = useApi(kialiApiRef);
  const [istioValidations, setIstioValidations] = React.useState<
    IstioConfigItem[] | undefined
  >();
  const workloadIstioResources = [
    'gateways',
    'authorizationpolicies',
    'peerauthentications',
    'sidecars',
    'requestauthentications',
    'envoyfilters',
  ];
  const labels = workloadProps.workload.labels
    ? workloadProps.workload?.labels
    : {};
  const wkLabels: string[] = [];
  Object.keys(labels).forEach(key => {
    const label = key + (labels[key] ? `=${labels[key]}` : '');
    wkLabels.push(label);
  });
  const workloadSelector = wkLabels.join(',');

  const wkIstioTypes = [
    { field: 'gateways', validation: 'gateway' },
    { field: 'sidecars', validation: 'sidecar' },
    { field: 'envoyFilters', validation: 'envoyfilter' },
    { field: 'requestAuthentications', validation: 'requestauthentication' },
    { field: 'authorizationPolicies', validation: 'authorizationpolicy' },
    { field: 'peerAuthentications', validation: 'peerauthentication' },
  ];

  const getValidations = async (istioConfigResponse: IstioConfigList) => {
    const istioConfigItems = istioConfigResponse
      ? toIstioItems(istioConfigResponse, workloadProps.workload?.cluster || '')
      : [];
    if (workloadProps.workload) {
      if (istioConfigResponse?.validations) {
        const typeNames: { [key: string]: string[] } = {};
        wkIstioTypes.forEach(wkIstioType => {
          if (
            istioConfigResponse &&
            istioConfigResponse.validations[wkIstioType.validation]
          ) {
            typeNames[wkIstioType.validation] = [];
            // @ts-ignore
            istioConfigResponse[wkIstioType.field]?.forEach(r =>
              typeNames[wkIstioType.validation].push(r.metadata.name),
            );
          }
        });
      }
    }

    setIstioValidations(istioConfigItems);
  };

  const fetchIstioConfig = async () => {
    kialiClient
      .getIstioConfig(
        namespace,
        workloadIstioResources,
        true,
        '',
        workloadSelector,
        workloadProps.workload?.cluster,
      )
      .then((istioConfigResponse: IstioConfigList) => {
        getValidations(istioConfigResponse);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      fetchIstioConfig();
    },
    [],
    { loading: true },
  );

  useDebounce(refresh, 10);
  if (loading) {
    return <CircularProgress />;
  }

  // All information for validations is fetched in the workload, no need to add another call
  const workloadValidations = (workload: Workload): Validations => {
    const noIstiosidecar: ObjectCheck = {
      message: 'Pod has no Istio sidecar',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const noAppLabel: ObjectCheck = {
      message: 'Pod has no app label',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const noVersionLabel: ObjectCheck = {
      message: 'Pod has no version label',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const pendingPod: ObjectCheck = {
      message: 'Pod is in Pending Phase',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const unknownPod: ObjectCheck = {
      message: 'Pod is in Unknown Phase',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failedPod: ObjectCheck = {
      message: 'Pod is in Failed Phase',
      severity: ValidationTypes.Error,
      path: '',
    };
    const failingPodContainer: ObjectCheck = {
      message: 'Pod has failing container',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failingPodIstioContainer: ObjectCheck = {
      message: 'Pod has failing Istio container',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failingPodAppContainer: ObjectCheck = {
      message: 'Pod has failing app container',
      severity: ValidationTypes.Warning,
      path: '',
    };

    const istioLabels = serverConfig.istioLabels;
    const istioAnnotations = serverConfig.istioAnnotations;

    const checkPodContainers = (
      containerInfo: ContainerInfo[],
    ): ObjectCheck[] => {
      const validations: ObjectCheck[] = [];
      containerInfo.forEach(c => {
        if (!c.isReady && validations.indexOf(failingPodAppContainer) === -1) {
          validations.push(failingPodAppContainer);
        }
      });
      return validations;
    };

    const checkIstioContainers = (
      containerInfo: ContainerInfo[],
    ): ObjectCheck[] => {
      const validations: ObjectCheck[] = [];
      containerInfo.forEach(c => {
        if (
          !c.isReady &&
          validations.indexOf(failingPodIstioContainer) === -1
        ) {
          validations.push(failingPodIstioContainer);
        }
      });
      return validations;
    };

    const addMeshValidations = (pod: Pod): ObjectCheck[] => {
      const validations: ObjectCheck[] = [];
      if (
        !(
          serverConfig.ambientEnabled &&
          (pod.annotations
            ? pod.annotations[istioAnnotations.ambientAnnotation] ===
              istioAnnotations.ambientAnnotationEnabled
            : false)
        )
      ) {
        validations.push(noIstiosidecar);
      }
      return validations;
    };

    const getPodValidations = (pod: Pod): ObjectValidation => {
      const validations: ObjectValidation = {
        name: pod.name,
        objectType: 'pod',
        valid: true,
        checks: [],
      };

      if (!pod.istioContainers || pod.istioContainers.length === 0) {
        validations.checks.concat(addMeshValidations(pod));
      } else {
        validations.checks.concat(checkIstioContainers(pod.istioContainers));
      }

      if (!pod.containers || pod.containers.length === 0) {
        validations.checks.push(failingPodContainer);
      } else {
        validations.checks.concat(checkPodContainers(pod.containers));
      }
      if (!pod.labels) {
        validations.checks.push(noAppLabel);
        validations.checks.push(noVersionLabel);
      } else {
        if (!pod.appLabel) {
          validations.checks.push(noAppLabel);
        }
        if (!pod.versionLabel) {
          validations.checks.push(noVersionLabel);
        }
      }
      return validations;
    };

    const validations: Validations = {};
    const isWaypoint =
      serverConfig.ambientEnabled &&
      workload.labels &&
      workload.labels[istioLabels.ambientWaypointLabel] ===
        istioLabels.ambientWaypointLabelValue;

    if (workload.pods.length > 0) {
      validations.pod = {};
      workload.pods.forEach(pod => {
        validations.pod[pod.name] = {
          name: pod.name,
          objectType: 'pod',
          valid: true,
          checks: [],
        };
        if (!isIstioNamespace(namespace) && !isWaypoint) {
          validations.pod[pod.name] = getPodValidations(pod);
        }

        switch (pod.status) {
          case 'Pending':
            validations.pod[pod.name].checks.push(pendingPod);
            break;
          case 'Unknown':
            validations.pod[pod.name].checks.push(unknownPod);
            break;
          case 'Failed':
            validations.pod[pod.name].checks.push(failedPod);
            break;
          default:
          // Pod healthy
        }
        // If statusReason is present
        if (pod.statusReason) {
          validations.pod[pod.name].checks.push({
            message: pod.statusReason,
            severity: ValidationTypes.Warning,
            path: '',
          });
        }
        validations.pod[pod.name].valid =
          validations.pod[pod.name].checks.length === 0;
      });
    }
    return validations;
  };

  const size =
    workloadProps.view === ENTITY || workloadProps.view === DRAWER ? 12 : 4;
  return (
    <>
      {workloadProps.workload && (
        <Grid container spacing={1} style={{ paddingTop: '20px' }}>
          <Grid key={`Card_${workloadProps.workload?.name}`} item xs={size}>
            <WorkloadDescription
              entity={workloadProps.entity}
              workload={workloadProps.workload}
              health={workloadProps.health}
              namespace={namespace}
              view={workloadProps.view}
            />
          </Grid>
          {workloadProps.view !== DRAWER && (
            <>
              <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
                <WorkloadPods
                  namespace={namespace}
                  workload={workloadProps.workload?.name || ''}
                  pods={pods}
                  validations={
                    workloadProps.workload
                      ? workloadValidations(workloadProps.workload).pod || {}
                      : {}
                  }
                />
              </Grid>
              <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
                <IstioConfigCard
                  name={
                    workloadProps.workload ? workloadProps.workload.name : ''
                  }
                  items={istioValidations ? istioValidations : []}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};
