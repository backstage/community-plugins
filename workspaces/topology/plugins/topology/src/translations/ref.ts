/*
 * Copyright 2025 The Backstage Authors
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
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

// CRITICAL: Export messages separately for testing
export const topologyMessages = {
  page: {
    title: 'Topology',
    subtitle: 'Kubernetes workload topology visualization',
  },
  toolbar: {
    cluster: 'Cluster',
    selectCluster: 'Select Cluster',
    displayOptions: 'Display options',
    currentDisplayOptions: 'Current display options',
  },
  emptyState: {
    noResourcesFound: 'No resources found',
    noResourcesDescription:
      'No Kubernetes resources were found in the selected cluster.',
  },
  permissions: {
    missingPermission: 'Missing Permission',
    missingPermissionDescription:
      'To view Topology, your administrator must grant you {{permissions}} {{permissionText}}.',
    missingPermissionDescription_plural:
      'To view Topology, your administrator must grant you {{permissions}} {{permissionText}}.',
    permission: 'permission',
    permissions: 'permissions',
    goBack: 'Go back',
  },
  sideBar: {
    details: 'Details',
    resources: 'Resources',
  },
  status: {
    running: 'Running',
    pending: 'Pending',
    succeeded: 'Succeeded',
    failed: 'Failed',
    unknown: 'Unknown',
    terminating: 'Terminating',
    crashLoopBackOff: 'CrashLoopBackOff',
    error: 'Error',
    warning: 'Warning',
    ready: 'Ready',
    notReady: 'Not Ready',
    active: 'Active',
    inactive: 'Inactive',
    updating: 'Updating',
    evicted: 'Evicted',
    cancelled: 'Cancelled',
  },
  details: {
    name: 'Name',
    namespace: 'Namespace',
    labels: 'Labels',
    annotations: 'Annotations',
    createdAt: 'Created',
    age: 'Age',
    replicas: 'Replicas',
    availableReplicas: 'Available Replicas',
    readyReplicas: 'Ready Replicas',
    updatedReplicas: 'Updated Replicas',
    selector: 'Selector',
    strategy: 'Strategy',
    image: 'Image',
    ports: 'Ports',
    volumes: 'Volumes',
    volumeMounts: 'Volume Mounts',
    environmentVariables: 'Environment Variables',
    resourceRequirements: 'Resource Requirements',
    limits: 'Limits',
    requests: 'Requests',
    cpu: 'CPU',
    memory: 'Memory',
    storage: 'Storage',
    noLabels: 'No labels',
    noAnnotations: 'No annotations',
    noOwner: 'No owner',
    notAvailable: 'Not available',
    notConfigured: 'Not configured',
    updateStrategy: 'Update strategy',
    maxUnavailable: 'Max unavailable',
    maxSurge: 'Max surge',
    progressDeadlineSeconds: 'Progress deadline seconds',
    minReadySeconds: 'Min ready seconds',
    desiredCompletions: 'Desired completions',
    parallelism: 'Parallelism',
    activeDeadlineSeconds: 'Active deadline seconds',
    currentCount: 'Current count',
    desiredCount: 'Desired count',
    schedule: 'Schedule',
    concurrencyPolicy: 'Concurrency policy',
    startingDeadlineSeconds: 'Starting deadline seconds',
    lastScheduleTime: 'Last schedule time',
    maxSurgeDescription: '{{maxSurge}} greater than {{replicas}} pod',
    maxUnavailableDescription: '{{maxUnavailable}} of {{replicas}} pod',
  },
  logs: {
    download: 'Download',
    noLogsFound: 'No logs found',
    selectContainer: 'Select Container',
    container: 'Container',
    pod: 'Pod',
    showPrevious: 'Show Previous',
    follow: 'Follow',
    refresh: 'Refresh',
    timestamps: 'Timestamps',
    wrapLines: 'Wrap Lines',
    clearLogs: 'Clear Logs',
    logLevel: 'Log Level',
    search: 'Search',
    noMatchingLogs: 'No matching logs found',
  },
  resources: {
    noResourcesFound: 'No {{resourceType}} found for this resource.',
    showingLatest: 'Showing latest {{count}} {{resourceType}}',
  },
  time: {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
  },
  events: {
    type: 'Type',
    reason: 'Reason',
    message: 'Message',
    source: 'Source',
    firstSeen: 'First Seen',
    lastSeen: 'Last Seen',
    count: 'Count',
    noEventsFound: 'No events found',
  },
  filters: {
    showLabels: 'Show Labels',
    showPodCount: 'Show Pod Count',
    expandApplicationGroups: 'Expand Application Groups',
    showConnectors: 'Show Connectors',
  },
  common: {
    status: 'Status',
    owner: 'Owner',
    location: 'Location',
    viewLogs: 'View Logs',
  },
  bootOrder: {
    summary: 'Boot Order Summary',
    emptySummary: 'No boot order configured',
    disk: 'Disk',
    network: 'Network',
    cdrom: 'CD-ROM',
  },
  vm: {
    status: {
      starting: 'Starting',
      stopping: 'Stopping',
      stopped: 'Stopped',
      paused: 'Paused',
      migrating: 'Migrating',
      provisioning: 'Provisioning',
      errorUnschedulable: 'ErrorUnschedulable',
      errorImagePull: 'ErrorImagePull',
      imageNotReady: 'ImageNotReady',
      waitingForVolumeBinding: 'WaitingForVolumeBinding',
    },
  },
};

/**
 * Translation reference for the Topology plugin.
 * @alpha
 */
export const topologyTranslationRef = createTranslationRef({
  id: 'plugin.topology',
  messages: topologyMessages,
});
