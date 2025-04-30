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
import { createElement, useMemo } from 'react';

import { V1DaemonSet, V1Deployment, V1Pod } from '@kubernetes/client-node';
import { ChartLabel } from '@patternfly/react-charts/victory';
import classNames from 'classnames';

import { AllPodStatus } from '../components/Pods/pod';
import { CronJobGVK, DaemonSetGVK, JobGVK, PodGVK } from '../models';
import { K8sWorkloadResource } from '../types/types';
import { getPodStatus } from './workload-node-utils';

const getTitleComponent = (
  longTitle: boolean = false,
  longSubtitle: boolean = false,
  reversed: boolean = false,
) => {
  const labelClasses = classNames('pf-v6-chart-donut-title', {
    'pod-ring__center-text--reversed': reversed,
    'pod-ring__center-text': !reversed,
    'pod-ring__long-text': longTitle,
  });
  return createElement(ChartLabel, {
    dy: longSubtitle ? -5 : 0,
    style: { lineHeight: '11px' },
    className: labelClasses,
  });
};

const podKindString = (count: number) => (count === 1 ? 'Pod' : 'Pods');

const isPendingPods = (
  pods: V1Pod[],
  currentPodCount?: number,
  desiredPodCount?: number,
): boolean =>
  (pods?.length === 1 && pods[0].status?.phase === 'Pending') ||
  (!currentPodCount && !!desiredPodCount);

const getFailedPods = (pods: any[]): number => {
  if (!pods?.length) {
    return 0;
  }

  return pods.reduce((acc, currValue) => {
    if (
      [AllPodStatus.CrashLoopBackOff, AllPodStatus.Failed].includes(
        getPodStatus(currValue),
      )
    ) {
      return acc + 1;
    }
    return acc;
  }, 0);
};

const getTitleAndSubtitle = (
  isPending: boolean,
  currentPodCount?: number,
  desiredPodCount?: number,
) => {
  let titlePhrase;
  let subTitlePhrase = '';
  let longTitle = false;
  let longSubtitle = false;

  // handles the initial state when the first pod is coming up and the state for no pods(scaled to zero)
  if (!currentPodCount) {
    titlePhrase = isPending ? '0' : 'Scaled to 0';
    longTitle = !isPending;
    if (desiredPodCount) {
      subTitlePhrase = `Scaling to ${desiredPodCount}`;
      longSubtitle = true;
    }
  }

  // handles the idle state or scaling to desired no. of pods
  if (currentPodCount) {
    titlePhrase = currentPodCount.toString();
    if (currentPodCount === desiredPodCount) {
      subTitlePhrase = podKindString(currentPodCount);
    } else {
      subTitlePhrase = `Scaling to ${desiredPodCount}`;
      longSubtitle = true;
    }
  }

  return {
    title: titlePhrase,
    longTitle,
    subTitle: subTitlePhrase,
    longSubtitle,
  };
};

const podRingLabel = (
  obj: K8sWorkloadResource,
  ownerKind: string,
  pods: V1Pod[],
) => {
  let currentPodCount = 0;
  let desiredPodCount;
  let isPending;
  let titleData;
  const podRingLabelData = {
    title: '',
    subTitle: '',
    longTitle: false,
    longSubtitle: false,
    reversed: false,
  };

  const failedPodCount = getFailedPods(pods);
  switch (ownerKind) {
    case DaemonSetGVK.kind:
      currentPodCount =
        ((obj as V1DaemonSet).status?.currentNumberScheduled || 0) +
        failedPodCount;
      desiredPodCount = (obj as V1DaemonSet).status?.desiredNumberScheduled;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      titleData = getTitleAndSubtitle(
        isPending,
        currentPodCount,
        desiredPodCount,
      );
      podRingLabelData.title = titleData.title as string;
      podRingLabelData.subTitle = titleData.subTitle;
      podRingLabelData.longSubtitle = titleData.longSubtitle;
      break;
    case PodGVK.kind:
    case JobGVK.kind:
      podRingLabelData.title = '1';
      podRingLabelData.subTitle = PodGVK.kind;
      break;
    case CronJobGVK.kind:
      podRingLabelData.title = `${pods.length}`;
      podRingLabelData.subTitle = podKindString(currentPodCount);
      break;
    default:
      currentPodCount =
        ((obj as V1Deployment)?.status?.readyReplicas || 0) + failedPodCount;
      desiredPodCount = (obj as V1Deployment)?.spec?.replicas;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      titleData = getTitleAndSubtitle(
        isPending,
        currentPodCount,
        desiredPodCount,
      );
      podRingLabelData.title = titleData.title as string;
      podRingLabelData.subTitle = titleData.subTitle;
      podRingLabelData.longTitle = titleData.longTitle;
      podRingLabelData.longSubtitle = titleData.longSubtitle;
      break;
  }

  return podRingLabelData;
};

export const usePodRingLabel = (
  obj: K8sWorkloadResource,
  ownerKind: string,
  pods: V1Pod[],
) => {
  const podRingLabelData = podRingLabel(obj, ownerKind, pods);
  const { title, subTitle, longTitle, longSubtitle, reversed } =
    podRingLabelData;

  return useMemo(
    () => ({
      title,
      subTitle,
      titleComponent: getTitleComponent(longTitle, longSubtitle, reversed),
    }),
    [longSubtitle, longTitle, reversed, subTitle, title],
  );
};

export const getSize = (val: any): number => {
  if (!val) {
    return 0;
  }
  return Object.keys(val).length;
};
