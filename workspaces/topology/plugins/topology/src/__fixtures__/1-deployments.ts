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
export const customResourceRoute = {
  metadata: {
    name: 'hello-minikube2',
    namespace: 'test-app',
    uid: '17c0f520-3878-4834-96a1-b19854f0d06f',
    resourceVersion: '174049',
    creationTimestamp: '2023-05-22T08:14:25Z',
    labels: {
      app: 'hello-minikube2',
      'app.kubernetes.io/component': 'hello-minikube2',
      'app.kubernetes.io/instance': 'hello-minikube2',
      'app.kubernetes.io/name': 'hello-minikube2',
      'app.openshift.io/runtime': 'nodejs',
      'app.openshift.io/runtime-version': '16-ubi8',
      'backstage.io/kubernetes-id': 'backstage',
    },
    annotations: {
      'openshift.io/host.generated': 'true',
    },
  },
  spec: {
    host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
    to: {
      kind: 'Service',
      name: 'hello-world',
      weight: 100,
    },
    port: {
      targetPort: '8080-tcp',
    },
    tls: {
      termination: 'edge',
      insecureEdgeTerminationPolicy: 'Redirect',
    },
    wildcardPolicy: 'None',
  },
  status: {
    ingress: [
      {
        host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
        routerName: 'default',
        conditions: [
          {
            type: 'Admitted',
            status: 'True',
            lastTransitionTime: '2023-05-22T08:14:25Z',
          },
        ],
        wildcardPolicy: 'None',
        routerCanonicalHostname:
          'router-default.apps.viraj-22-05-2023-0.devcluster.openshift.com',
      },
    ],
  },
};
export const mockKubernetesResponse = {
  virtualMachines: [
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        annotations: {
          'kubemacpool.io/transaction-timestamp':
            '2024-08-07T10:46:35.842565627Z',
          'kubevirt.io/latest-observed-api-version': 'v1',
        },
        creationTimestamp: '2024-08-07T10:46:02Z',
        finalizers: ['kubevirt.io/virtualMachineControllerFinalize'],
        generation: 1,
        labels: {
          app: 'fedora-turquoise-rooster-85',
          'backstage.io/kubernetes-id': 'nationalparks-py',
          'kubevirt.io/dynamic-credentials-support': 'true',
          'vm.kubevirt.io/template': 'fedora-server-small',
          'vm.kubevirt.io/template.namespace': 'openshift',
          'vm.kubevirt.io/template.revision': '1',
          'vm.kubevirt.io/template.version': 'v0.29.1',
        },
        name: 'fedora-turquoise-rooster-85',
        namespace: 'mitesh',
        resourceVersion: '307175',
        uid: 'd6a524d8-a41e-42b3-8c61-3e99c7e76234',
      },
      spec: {
        dataVolumeTemplates: [
          {
            apiVersion: 'cdi.kubevirt.io/v1beta1',
            kind: 'DataVolume',
            metadata: {
              creationTimestamp: null,
              name: 'fedora-turquoise-rooster-85',
            },
            spec: {
              sourceRef: {
                kind: 'DataSource',
                name: 'fedora',
                namespace: 'openshift-virtualization-os-images',
              },
              storage: {
                resources: {
                  requests: {
                    storage: '30Gi',
                  },
                },
              },
            },
          },
        ],
        running: true,
        template: {
          metadata: {
            annotations: {
              'vm.kubevirt.io/flavor': 'small',
              'vm.kubevirt.io/os': 'fedora',
              'vm.kubevirt.io/workload': 'server',
            },
            creationTimestamp: null,
            labels: {
              'kubevirt.io/domain': 'fedora-turquoise-rooster-85',
              'kubevirt.io/size': 'small',
              'network.kubevirt.io/headlessService': 'headless',
            },
          },
          spec: {
            architecture: 'amd64',
            domain: {
              cpu: {
                cores: 1,
                sockets: 1,
                threads: 1,
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                  },
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'cloudinitdisk',
                  },
                ],
                interfaces: [
                  {
                    macAddress: '02:05:b4:00:00:01',
                    masquerade: {},
                    model: 'virtio',
                    name: 'default',
                  },
                ],
                rng: {},
              },
              features: {
                acpi: {},
                smm: {
                  enabled: true,
                },
              },
              firmware: {
                bootloader: {
                  efi: {},
                },
              },
              machine: {
                type: 'pc-q35-rhel9.4.0',
              },
              memory: {
                guest: '2Gi',
              },
              resources: {},
            },
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 180,
            volumes: [
              {
                dataVolume: {
                  name: 'fedora-turquoise-rooster-85',
                },
                name: 'rootdisk',
              },
              {
                cloudInitNoCloud: {
                  userData:
                    '#cloud-config\nuser: fedora\npassword: kfi7-yxx7-ub8h\nchpasswd: { expire: False }',
                },
                name: 'cloudinitdisk',
              },
            ],
          },
        },
      },
      status: {
        conditions: [
          {
            lastProbeTime: '2024-08-07T10:46:03Z',
            lastTransitionTime: '2024-08-07T10:46:03Z',
            message: 'Guest VM is not reported as running',
            reason: 'GuestNotRunning',
            status: 'False',
            type: 'Ready',
          },
          {
            lastProbeTime: null,
            lastTransitionTime: null,
            message: "Not all of the VMI's DVs are ready",
            reason: 'NotAllDVsReady',
            status: 'False',
            type: 'DataVolumesReady',
          },
          {
            lastProbeTime: null,
            lastTransitionTime: '2024-08-07T10:46:03Z',
            message:
              '0/6 nodes are available: 3 Insufficient devices.kubevirt.io/kvm, 3 node(s) had untolerated taint {node-role.kubernetes.io/master: }. preemption: 0/6 nodes are available: 3 No preemption victims found for incoming pod, 3 Preemption is not helpful for scheduling.',
            reason: 'Unschedulable',
            status: 'False',
            type: 'PodScheduled',
          },
        ],
        created: true,
        desiredGeneration: 1,
        observedGeneration: 1,
        printableStatus: 'ErrorUnschedulable',
        runStrategy: 'Always',
        volumeSnapshotStatuses: [
          {
            enabled: true,
            name: 'rootdisk',
          },
          {
            enabled: false,
            name: 'cloudinitdisk',
            reason:
              'Snapshot is not supported for this volumeSource type [cloudinitdisk]',
          },
        ],
      },
    },
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        annotations: {
          'kubemacpool.io/transaction-timestamp':
            '2024-08-07T10:47:43.467479762Z',
          'kubevirt.io/storage-observed-api-version': 'v1',
        },
        creationTimestamp: '2024-08-07T10:47:23Z',
        finalizers: ['kubevirt.io/virtualMachineControllerFinalize'],
        generation: 1,
        labels: {
          app: 'win2k22-purple-aphid-31',
          'backstage.io/kubernetes-id': 'nationalparks-py',
          'vm.kubevirt.io/template': 'windows2k22-server-medium',
          'vm.kubevirt.io/template.namespace': 'openshift',
          'vm.kubevirt.io/template.revision': '1',
          'vm.kubevirt.io/template.version': 'v0.29.1',
        },
        name: 'win2k22-purple-aphid-31',
        namespace: 'mitesh',
        resourceVersion: '308786',
        uid: '1957cf88-52c0-4e61-ad1d-211eaa72e56b',
      },
      spec: {
        dataVolumeTemplates: [
          {
            apiVersion: 'cdi.kubevirt.io/v1beta1',
            kind: 'DataVolume',
            metadata: {
              creationTimestamp: null,
              name: 'win2k22-purple-aphid-31',
            },
            spec: {
              sourceRef: {
                kind: 'DataSource',
                name: 'win2k22',
                namespace: 'openshift-virtualization-os-images',
              },
              storage: {
                resources: {
                  requests: {
                    storage: '60Gi',
                  },
                },
              },
            },
          },
        ],
        running: true,
        template: {
          metadata: {
            annotations: {
              'vm.kubevirt.io/flavor': 'medium',
              'vm.kubevirt.io/os': 'windows2k22',
              'vm.kubevirt.io/workload': 'server',
            },
            creationTimestamp: null,
            labels: {
              'kubevirt.io/domain': 'win2k22-purple-aphid-31',
              'kubevirt.io/size': 'medium',
              'network.kubevirt.io/headlessService': 'headless',
            },
          },
          spec: {
            architecture: 'amd64',
            domain: {
              clock: {
                timer: {
                  hpet: {
                    present: false,
                  },
                  hyperv: {},
                  pit: {
                    tickPolicy: 'delay',
                  },
                  rtc: {
                    tickPolicy: 'catchup',
                  },
                },
                utc: {},
              },
              cpu: {
                cores: 1,
                sockets: 1,
                threads: 1,
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'sata',
                    },
                    name: 'rootdisk',
                  },
                  {
                    cdrom: {
                      bus: 'sata',
                    },
                    name: 'windows-drivers-disk',
                  },
                ],
                inputs: [
                  {
                    bus: 'usb',
                    name: 'tablet',
                    type: 'tablet',
                  },
                ],
                interfaces: [
                  {
                    macAddress: '02:05:b4:00:00:02',
                    masquerade: {},
                    model: 'e1000e',
                    name: 'default',
                  },
                ],
                tpm: {},
              },
              features: {
                acpi: {},
                apic: {},
                hyperv: {
                  frequencies: {},
                  ipi: {},
                  reenlightenment: {},
                  relaxed: {},
                  reset: {},
                  runtime: {},
                  spinlocks: {
                    spinlocks: 8191,
                  },
                  synic: {},
                  synictimer: {
                    direct: {},
                  },
                  tlbflush: {},
                  vapic: {},
                  vpindex: {},
                },
                smm: {},
              },
              firmware: {
                bootloader: {
                  efi: {
                    secureBoot: true,
                  },
                },
              },
              machine: {
                type: 'pc-q35-rhel9.4.0',
              },
              memory: {
                guest: '4Gi',
              },
              resources: {},
            },
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 3600,
            volumes: [
              {
                dataVolume: {
                  name: 'win2k22-purple-aphid-31',
                },
                name: 'rootdisk',
              },
              {
                containerDisk: {
                  image:
                    'registry.redhat.io/container-native-virtualization/virtio-win-rhel9@sha256:584857c3d7cee20877a4ea135fb58fd7721dfc04a23a6c76580eba9facd6e6c0',
                },
                name: 'windows-drivers-disk',
              },
            ],
          },
        },
      },
      status: {
        conditions: [
          {
            lastProbeTime: '2024-08-07T10:47:24Z',
            lastTransitionTime: '2024-08-07T10:47:24Z',
            message: 'VMI does not exist',
            reason: 'VMINotExists',
            status: 'False',
            type: 'Ready',
          },
        ],
        printableStatus: 'Provisioning',
        volumeSnapshotStatuses: [
          {
            enabled: false,
            name: 'rootdisk',
            reason: 'PVC not found',
          },
          {
            enabled: false,
            name: 'windows-drivers-disk',
            reason:
              'Snapshot is not supported for this volumeSource type [windows-drivers-disk]',
          },
        ],
      },
    },
  ],
  pods: [
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'test-deployment-645f8d4887-8dmrr',
        generateName: 'test-deployment-645f8d4887-',
        namespace: 'test-app',
        uid: 'c98130d7-a1bd-4f93-8477-e00a1971b9bd',
        resourceVersion: '42257',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': '645f8d4887',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'test-deployment-645f8d4887',
            uid: '6165cda0-8ada-4468-960d-122b5230db27',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container-hello',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: '2023-02-15T09:00:37Z',
        containerStatuses: [
          {
            name: 'container-hello',
            state: {
              running: {
                startedAt: '2023-02-15T09:00:43Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 1,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'test-deployment-645f8d4887-8dmrr',
        generateName: 'test-deployment-645f8d4887-',
        namespace: 'test-app',
        uid: 'c98130d7-a1bd-4f93-8477-e00a1971b9bd',
        resourceVersion: '42257',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': '645f8d4887',
        },
        ownerReferences: [
          {
            apiVersion: 'batch/v1',
            kind: 'Job',
            name: 'busybox-cron-27992986',
            uid: 'da070cbb-aa23-40bd-ae90-8db1354b2044',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: new Date('2023-02-15T09:00:43Z'),
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'test-deployment-645f8d4887-d77ff',
        generateName: 'test-deployment-645f8d4887-',
        namespace: 'test-app',
        uid: 'e656560a-8113-4578-946e-2407ad0530af',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'test-deployment-645f8d4887',
            uid: '6165cda0-8ada-4468-960d-122b5230db27',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: new Date('2023-02-15T09:00:37Z'),
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: new Date('2023-02-15T09:00:43Z'),
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'test-deployment-645f8d4887-n8644',
        generateName: 'test-deployment-645f8d4887-',
        namespace: 'test-app',
        uid: '966d4fa1-379a-4dea-8add-2dcff7257dcd',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'test-deployment-645f8d4887',
            uid: '6165cda0-8ada-4468-960d-122b5230db27',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: new Date('2023-02-15T09:00:37Z'),
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: new Date('2023-02-15T09:00:43Z'),
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world-bfb8bb77-vrptd',
        generateName: 'hello-world-bfb8bb77-',
        namespace: 'test-app',
        uid: 'e656560a-8113-4578-946e-2407ad0530af',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'hello-world-bfb8bb77',
            uid: 'a69e8b1c-6721-44f6-97de-542fd2892419',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: new Date('2023-02-15T09:00:37Z'),
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: new Date('2023-02-15T09:00:43Z'),
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world-45-bfb8bb77-z89wc',
        generateName: 'hello-world-45-bfb8bb77-',
        namespace: 'test-app',
        uid: '649ccf32-0cb5-4d75-9cd2-cb0079edd4f9',
        resourceVersion: '491057',
        creationTimestamp: '2023-03-08T07:32:27Z',
        labels: {
          app: 'hello-world-45',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'hello-world-45-bfb8bb77',
            uid: 'cdae3fc6-67ae-4af0-97f6-7590f517a91b',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-xgcgh',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-xgcgh',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:27Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:31Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:31Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:27Z',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.97',
        podIPs: [
          {
            ip: '10.244.0.97',
          },
        ],
        startTime: '2023-03-08T07:32:27Z',
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: '2023-03-08T07:32:30Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://02957da29b2f48df90210d1f96df8953b4c4ac438b9b7a00fb339042cf6fe70a',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'example-0',
        generateName: 'example-',
        namespace: 'test-app',
        uid: 'e656560a-8113-4578-946e-2407ad0530af',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'StatefulSet',
            name: 'example',
            uid: 'b7e67f5c-3f68-4ff5-bee4-43a9b388aa6f',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
          },
          {
            type: 'Ready',
            status: 'True',
          },
          {
            type: 'ContainersReady',
            status: 'True',
          },
          {
            type: 'PodScheduled',
            status: 'True',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: new Date('2023-02-15T09:00:37Z'),
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: new Date('2023-02-15T09:00:43Z'),
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'example-0',
        generateName: 'example-',
        namespace: 'test-app',
        uid: 'e656560a-8113-4578-946e-2407ad0530af',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'DaemonSet',
            name: 'example',
            uid: '0c4a82c9-a6e6-11e9-a20f-52fdfc072182',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:37Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:43Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:43Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:36Z',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: '2023-02-15T09:00:37Z',
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: '2023-02-15T09:00:43Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
  ],
  replicasets: [
    {
      kind: 'ReplicaSet',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'test-deployment-645f8d4887',
        namespace: 'test-app',
        uid: '6165cda0-8ada-4468-960d-122b5230db27',
        resourceVersion: '42258',
        generation: 1,
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '3',
          'deployment.kubernetes.io/max-replicas': '4',
          'deployment.kubernetes.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'test-deployment',
            uid: 'd358f6d8-5940-4035-9cc4-72c8e2de70d4',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
            'pod-template-hash': 'bfb8bb77',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
              'pod-template-hash': 'bfb8bb77',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {
        replicas: 3,
        fullyLabeledReplicas: 3,
        readyReplicas: 3,
        availableReplicas: 3,
        observedGeneration: 1,
      },
    },
    {
      kind: 'ReplicaSet',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-bfb8bb77',
        namespace: 'test-app',
        uid: 'a69e8b1c-6721-44f6-97de-542fd2892419',
        resourceVersion: '42258',
        generation: 1,
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '1',
          'deployment.kubernetes.io/max-replicas': '2',
          'deployment.kubernetes.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'hello-world',
            uid: '17094219-d12e-431c-bb3f-ee0876f11b04',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
            'pod-template-hash': 'bfb8bb77',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
              'pod-template-hash': 'bfb8bb77',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {
        replicas: 1,
        fullyLabeledReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        observedGeneration: 1,
      },
    },
    {
      kind: 'ReplicaSet',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-45-bfb8bb77',
        namespace: 'test-app',
        uid: 'cdae3fc6-67ae-4af0-97f6-7590f517a91b',
        resourceVersion: '491058',
        generation: 1,
        creationTimestamp: '2023-03-08T07:32:26Z',
        labels: {
          app: 'hello-world-45',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '1',
          'deployment.kubernetes.io/max-replicas': '2',
          'deployment.kubernetes.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'hello-world-45',
            uid: '58f0c8ba-492a-4460-9105-dabe475062dd',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-world-45',
            'pod-template-hash': 'bfb8bb77',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'hello-world-45',
              'backstage.io/kubernetes-id': 'backstage',
              'pod-template-hash': 'bfb8bb77',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {
        replicas: 1,
        fullyLabeledReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        observedGeneration: 1,
      },
    },
  ],
  deployments: [
    {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'test-deployment',
        namespace: 'test-app',
        uid: 'd358f6d8-5940-4035-9cc4-72c8e2de70d4',
        resourceVersion: '42259',
        generation: 1,
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
          'app.kubernetes.io/instance': 'test-deployment',
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Available',
            status: 'True',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
          {
            type: 'Progressing',
            status: 'True',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-world-bfb8bb77" has successfully progressed.',
          },
        ],
      },
    },
    {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world',
        namespace: 'test-app',
        uid: '17094219-d12e-431c-bb3f-ee0876f11b04',
        resourceVersion: '42259',
        generation: 1,
        ownerReferences: [{ name: 'app', uid: 1 }],
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
          'app.kubernetes.io/instance': 'hello-world',
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Available',
            status: 'True',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
          {
            type: 'Progressing',
            status: 'True',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-world-bfb8bb77" has successfully progressed.',
          },
        ],
      },
    },
    {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-45',
        namespace: 'test-app',
        uid: '58f0c8ba-492a-4460-9105-dabe475062dd',
        resourceVersion: '491059',
        generation: 1,
        creationTimestamp: new Date('2023-02-15T09:00:36Z'),
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
          'app.kubernetes.io/instance': 'hello-world-45',
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-world-45',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'hello-world-45',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Available',
            status: 'True',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
          {
            type: 'Progressing',
            status: 'True',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-world-45-bfb8bb77" has successfully progressed.',
          },
        ],
      },
    },
  ],
  services: [
    {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world',
        namespace: 'test-app',
        uid: 'e5112e42-d7d5-476b-a2fd-ba10e722e2f1',
        resourceVersion: '325220',
        creationTimestamp: '2023-03-01T08:13:39Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
      },
      spec: {
        ports: [
          {
            protocol: 'TCP',
            port: 8080,
            targetPort: 8080,
            nodePort: 30497,
          },
        ],
        selector: {
          app: 'name',
        },
        clusterIP: '10.110.148.168',
        clusterIPs: ['10.110.148.168'],
        type: 'NodePort',
        sessionAffinity: 'None',
        externalTrafficPolicy: 'Cluster',
        ipFamilies: ['IPv4'],
        ipFamilyPolicy: 'SingleStack',
        internalTrafficPolicy: 'Cluster',
      },
      status: {
        loadBalancer: {},
      },
    },
    {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world-2',
        namespace: 'test-app',
        uid: 'e5112e42-d7d5-476b-a2fd-ba10e722e2f2',
        resourceVersion: '325221',
        creationTimestamp: '2023-03-01T08:13:39Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
      },
      spec: {
        ports: [
          {
            protocol: 'TCP',
            port: 8080,
            targetPort: 8080,
            nodePort: 30497,
          },
        ],
        selector: {
          app: 'hello-world',
        },
        clusterIP: '10.110.148.168',
        clusterIPs: ['10.110.148.168'],
        type: 'NodePort',
        sessionAffinity: 'None',
        externalTrafficPolicy: 'Cluster',
        ipFamilies: ['IPv4'],
        ipFamilyPolicy: 'SingleStack',
        internalTrafficPolicy: 'Cluster',
      },
      status: {
        loadBalancer: {},
      },
    },
  ],
  ingresses: [
    {
      kind: 'Ingress',
      apiVersion: 'networking.k8s.io/v1',
      metadata: {
        name: 'example-ingress-hello-world',
        namespace: 'test-app',
        uid: '72498002-509f-4a93-9924-4ffcdf3df5d5',
        resourceVersion: '325525',
        generation: 1,
        creationTimestamp: '2023-03-01T08:17:52Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/$1',
        },
      },
      spec: {
        ingressClassName: 'nginx',
        rules: [
          {
            host: 'hello-world-app.info',
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'hello-world',
                      port: {
                        number: 8080,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      status: {
        loadBalancer: {
          ingress: [
            {
              ip: '192.168.64.6',
            },
          ],
        },
      },
    },
  ],
  routes: [
    {
      ...customResourceRoute,
      kind: 'Route',
    },
  ],
  statefulsets: [
    {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: {
        generation: 1,
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
        },
        name: 'example-ss',
        namespace: 'deb-test',
        resourceVersion: '70480',
        uid: 'b7e67f5c-3f68-4ff5-bee4-43a9b388aa6f',
      },
      spec: {
        podManagementPolicy: 'OrderedReady',
        replicas: 3,
        revisionHistoryLimit: 10,
        selector: { matchLabels: {} },
        serviceName: 'httpd',
        template: {
          metadata: {},
        },
        updateStrategy: {
          type: 'RollingUpdate',
          rollingUpdate: {},
        },
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        currentReplicas: 1,
        updatedReplicas: 1,
        currentRevision: 'example-5bdc6b6c9b',
        updateRevision: 'example-5bdc6b6c9b',
        collisionCount: 0,
        availableReplicas: 0,
      },
    },
    {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: {
        generation: 1,
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
        },
        name: 'example',
        namespace: 'deb-test',
        resourceVersion: '70480',
        uid: 'c7afef06-4f6b-4582-9d3e-81ad69b10a75',
      },
      spec: {
        podManagementPolicy: 'OrderedReady',
        replicas: 3,
        revisionHistoryLimit: 10,
        selector: { matchLabels: {} },
        serviceName: 'httpd',
        template: {
          metadata: {
            labels: {
              app: 'name',
            },
          },
          spec: {
            terminationGracePeriodSeconds: 10,
            containers: {
              name: 'httpd',
              image:
                'image-registry.openshift-image-registry.svc:5000/openshift/httpd:latest',
              ports: [{ containerPort: 8080, name: 'web' }],
              volumeMounts: [{ name: 'www', mountPath: '/var/www/html' }],
            },
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
          rollingUpdate: {},
        },
      },
      status: {},
    },
  ],
  cronJobs: [
    {
      apiVersion: 'batch/v1',
      kind: 'CronJob',
      metadata: {
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
        },
        name: 'example',
        namespace: 'deb-test',
        resourceVersion: '70698',
        uid: '36869a06-aa02-425c-a2ea-3202a4f4d7d7',
      },
      spec: {
        schedule: '*/1 * * * *',
        jobTemplate: {
          metadata: {
            creationTimestamp: new Date('2023-03-08T07:32:26Z'),
          },
          spec: {
            template: {
              metadata: {
                creationTimestamp: new Date('2023-03-08T07:32:26Z'),
                labels: {
                  app: 'name',
                  'backstage.io/kubernetes-id': 'backstage',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'busybox',
                    image: 'busybox:latest',
                    resources: {},
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'Always',
                  },
                ],

                restartPolicy: 'OnFailure',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'ClusterFirst',
                securityContext: {},
                schedulerName: 'default-scheduler',
              },
              resources: {},
            },
          },
        },
      },
    },
  ],
  jobs: [
    {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        annotations: '',
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
        },
        name: 'busybox-cron-27992986',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'batch/v1',
            kind: 'CronJob',
            name: 'example',
            uid: '36869a06-aa02-425c-a2ea-3202a4f4d7d7',
          },
        ],
        uid: 'da070cbb-aa23-40bd-ae90-8db1354b2044',
      },
      spec: {},
      status: {},
    },
    {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        annotations: '',
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
        },
        name: 'pi',
        namespace: 'deb-test',
        uid: 'da070cbb-aa23-40bd-ae90-8db1354b2044',
      },
      spec: {
        template: {
          metadata: {
            name: 'pi',
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'pi',
                image: 'perl',
                command: ['perl', '-Mbignum=bpi', '-wle', 'print bpi(2000)'],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Never',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {},
    },
  ],
  daemonSets: [
    {
      metadata: {
        name: 'daemonset-testing',
        namespace: 'testing',
        uid: '0c4a82c9-a6e6-11e9-a20f-52fdfc072182',
        resourceVersion: '700614',
        generation: 1,
        annotations: {
          'deprecated.daemonset.template.generation': '1',
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: 'hello-openshift',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'name',
            },
          },
          spec: {
            containers: [
              {
                name: 'hello-openshift',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: 1,
          },
        },
        revisionHistoryLimit: 10,
      },
      status: {
        currentNumberScheduled: 1,
        numberMisscheduled: 0,
        desiredNumberScheduled: 1,
        numberReady: 0,
        observedGeneration: 1,
        updatedNumberScheduled: 1,
        numberUnavailable: 1,
      },
      kind: 'DaemonSet',
      apiVersion: 'apps/v1',
    },
  ],
  checlusters: [
    {
      apiVersion: 'org.eclipse.che/v2',
      kind: 'CheCluster',
      metadata: {
        annotations: {
          'che.eclipse.org/checluster-defaults-cleanup':
            '{"containers.resources":"true","spec.components.dashboard.headerMessage":"true","spec.components.pluginRegistry.openVSXURL":"true","spec.devEnvironments.defaultComponents":"true","spec.devEnvironments.defaultEditor":"true","spec.devEnvironments.disableContainerBuildCapabilities":"true"}',
        },
        resourceVersion: '305114',
        name: 'devspaces',
        uid: '53a9bc1e-6383-4800-90a5-6af8aabbf592',
        creationTimestamp: '2023-07-18T11:25:10Z',
        generation: 1,
        namespace: 'openshift-devspaces',
        labels: {
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
      },
      spec: {
        components: {
          cheServer: {
            debug: false,
            logLevel: 'INFO',
          },
          dashboard: {},
          database: {
            externalDb: false,
          },
          devWorkspace: {},
          devfileRegistry: {},
          imagePuller: {
            enable: false,
            spec: {},
          },
          metrics: {
            enable: true,
          },
          pluginRegistry: {},
        },
        containerRegistry: {},
        devEnvironments: {
          containerBuildConfiguration: {
            openShiftSecurityContextConstraint: 'container-build',
          },
          defaultNamespace: {
            autoProvision: true,
            template: '<username>-devspaces',
          },
          maxNumberOfWorkspacesPerUser: -1,
          secondsOfInactivityBeforeIdling: 1800,
          secondsOfRunBeforeIdling: -1,
          startTimeoutSeconds: 300,
          storage: {
            pvcStrategy: 'per-user',
          },
        },
        gitServices: {},
        networking: {
          auth: {
            gateway: {
              configLabels: {
                app: 'che',
                component: 'che-gateway-config',
              },
            },
          },
        },
      },
      status: {
        chePhase: 'Active',
        cheURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org',
        cheVersion: '3.7.0',
        devfileRegistryURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org/devfile-registry',
        gatewayPhase: 'Established',
        pluginRegistryURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org/plugin-registry/v3',
        workspaceBaseDomain: 'apps.rhoms-4.14-071804.dev.openshiftappsvc.org',
      },
    },
    {
      apiVersion: 'org.eclipse.che/v2',
      kind: 'CheCluster',
      metadata: {
        annotations: {
          'che.eclipse.org/checluster-defaults-cleanup':
            '{"containers.resources":"true","spec.components.dashboard.headerMessage":"true","spec.components.pluginRegistry.openVSXURL":"true","spec.devEnvironments.defaultComponents":"true","spec.devEnvironments.defaultEditor":"true","spec.devEnvironments.disableContainerBuildCapabilities":"true"}',
        },
        resourceVersion: '305114',
        name: 'devspaces2',
        uid: '53a9bc1e-6383-4800-90a5-6af8aabbf592',
        creationTimestamp: '2023-07-18T11:25:10Z',
        generation: 1,
        namespace: 'default',
        labels: {
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
      },
      spec: {
        components: {
          cheServer: {
            debug: false,
            logLevel: 'INFO',
          },
          dashboard: {},
          database: {
            externalDb: false,
          },
          devWorkspace: {},
          devfileRegistry: {},
          imagePuller: {
            enable: false,
            spec: {},
          },
          metrics: {
            enable: true,
          },
          pluginRegistry: {},
        },
        containerRegistry: {},
        devEnvironments: {
          containerBuildConfiguration: {
            openShiftSecurityContextConstraint: 'container-build',
          },
          defaultNamespace: {
            autoProvision: true,
            template: '<username>-devspaces',
          },
          maxNumberOfWorkspacesPerUser: -1,
          secondsOfInactivityBeforeIdling: 1800,
          secondsOfRunBeforeIdling: -1,
          startTimeoutSeconds: 300,
          storage: {
            pvcStrategy: 'per-user',
          },
        },
        gitServices: {},
        networking: {
          auth: {
            gateway: {
              configLabels: {
                app: 'che',
                component: 'che-gateway-config',
              },
            },
          },
        },
      },
      status: {
        chePhase: 'Active',
        cheURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org',
        cheVersion: '3.7.0',
        devfileRegistryURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org/devfile-registry',
        gatewayPhase: 'Established',
        pluginRegistryURL:
          'https://devspaces.apps.rhoms-4.14-071804.dev.openshiftappsvc.org/plugin-registry/v3',
        workspaceBaseDomain: 'apps.rhoms-4.14-071804.dev.openshiftappsvc.org',
      },
    },
  ],
};

export const mockK8sResourcesData = {
  loading: false,
  error: '',
  watchResourcesData: {
    deployments: {
      data: mockKubernetesResponse.deployments,
    },
    pods: {
      data: mockKubernetesResponse.pods,
    },
    replicaSets: {
      data: mockKubernetesResponse.replicasets,
    },
    services: {
      data: mockKubernetesResponse.services,
    },
    ingresses: {
      data: mockKubernetesResponse.ingresses,
    },
    routes: {
      data: mockKubernetesResponse.routes,
    },
    virtualmachines: {
      data: mockKubernetesResponse.virtualMachines,
    },
  },
};
