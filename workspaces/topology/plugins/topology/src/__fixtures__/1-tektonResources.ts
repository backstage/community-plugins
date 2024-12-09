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
export const mockTektonResources = {
  pipelineruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube:admin',
        },
        creationTimestamp: new Date('2023-03-30T07:03:04Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'test-deployment',
          'app.kubernetes.io/name': 'test-deployment',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/pipeline': 'test-deployment',
        },
        name: 'test-deployment-xf45fo',
        namespace: 'jai-test',
        resourceVersion: '87613',
        uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
      },
      spec: {
        params: [],
        pipelineRef: {
          name: 'test-deployment',
        },
        serviceAccountName: 'pipeline',
        timeout: '1h0m0s',
        workspaces: [],
      },
      status: {
        completionTime: '2023-03-30T07:05:13Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          params: [],
          tasks: [
            {
              name: 'fetch-repository',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'git-clone',
              },
              workspaces: [],
            },
            {
              name: 'build',
              params: [],
              runAfter: ['fetch-repository'],
              taskRef: {
                kind: 'ClusterTask',
                name: 's2i-ruby',
              },
              workspaces: [],
            },
            {
              name: 'deploy',
              params: [],
              runAfter: ['build'],
              taskRef: {
                kind: 'ClusterTask',
                name: 'openshift-client',
              },
            },
          ],
          workspaces: [],
        },
        startTime: '2023-03-30T07:03:04Z',
        taskRuns: {
          'ruby-ex-git-xf45fo-build': {
            pipelineTaskName: 'build',
            status: {
              completionTime: '2023-03-30T07:04:55Z',
              conditions: [
                {
                  lastTransitionTime: '2023-03-30T07:04:55Z',
                  message: 'All Steps have completed executing',
                  reason: 'Succeeded',
                  status: 'Unknown',
                  type: 'Succeeded',
                },
              ],
              podName: 'ruby-ex-git-xf45fo-build-pod',
              startTime: '2023-03-30T07:03:20Z',
              steps: [
                {
                  container: 'step-generate',
                  imageID:
                    'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
                  name: 'generate',
                  terminated: {
                    containerID:
                      'cri-o://3b490fe8f5ed9310fa7b322961e2069b3548a6a8134693ef78c12c8c0760ea0c',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:03:30Z',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:03:30Z',
                  },
                },
                {
                  container: 'step-build-and-push',
                  imageID:
                    'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
                  name: 'build-and-push',
                  terminated: {
                    containerID:
                      'cri-o://90521ea2114ca3fc6b54216fe8cff26b679788d1c87dee40b98caa90f71e140e',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:04:54Z',
                    message:
                      '[{"key":"IMAGE_DIGEST","value":"sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02","type":1}]',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:03:30Z',
                  },
                },
              ],
              taskResults: [
                {
                  name: 'IMAGE_DIGEST',
                  type: 'string',
                  value:
                    'sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02',
                },
              ],
              taskSpec: {
                description:
                  's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
                params: [],
                results: [
                  {
                    description: 'Digest of the image just built.',
                    name: 'IMAGE_DIGEST',
                    type: 'string',
                  },
                ],
                steps: [
                  {
                    env: [],
                    image:
                      'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
                    name: 'generate',
                    resources: {},
                    script: 'echo hi',
                    volumeMounts: [
                      {
                        mountPath: '/gen-source',
                        name: 'gen-source',
                      },
                      {
                        mountPath: '/env-vars',
                        name: 'env-vars',
                      },
                    ],
                    workingDir: '/workspace/source',
                  },
                  {
                    image:
                      'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
                    name: 'build-and-push',
                    resources: {},
                    script: 'echo hi',
                    securityContext: {
                      capabilities: {
                        add: ['SETFCAP'],
                      },
                    },
                    volumeMounts: [
                      {
                        mountPath: '/var/lib/containers',
                        name: 'varlibcontainers',
                      },
                      {
                        mountPath: '/gen-source',
                        name: 'gen-source',
                      },
                    ],
                    workingDir: '/gen-source',
                  },
                ],
                volumes: [
                  {
                    emptyDir: {},
                    name: 'varlibcontainers',
                  },
                  {
                    emptyDir: {},
                    name: 'gen-source',
                  },
                  {
                    emptyDir: {},
                    name: 'env-vars',
                  },
                ],
                workspaces: [],
              },
            },
          },
          'ruby-ex-git-xf45fo-deploy': {
            pipelineTaskName: 'deploy',
            status: {
              completionTime: '2023-03-30T07:05:13Z',
              conditions: [
                {
                  lastTransitionTime: '2023-03-30T07:05:13Z',
                  message: 'All Steps have completed executing',
                  reason: 'Succeeded',
                  status: 'Unknown',
                  type: 'Succeeded',
                },
              ],
              podName: 'ruby-ex-git-xf45fo-deploy-pod',
              startTime: '2023-03-30T07:04:55Z',
              steps: [
                {
                  container: 'step-oc',
                  imageID:
                    'image-registry.openshift-image-registry.svc:5000/openshift/cli@sha256:e2f0217ba0ea40703b104c1a70e8ecbcc6ba997041fff68467214f5ba87b52b6',
                  name: 'oc',
                  terminated: {
                    containerID:
                      'cri-o://1cf6af84b780655695cfba670fb8a6dad774667925eda98eda6e8f0400ef1723',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:05:12Z',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:05:02Z',
                  },
                },
              ],
              taskSpec: {
                description:
                  'This task runs commands against the cluster provided by user and if not provided then where the Task is being executed.\nOpenShift is a Kubernetes distribution from Red Hat which provides oc, the OpenShift CLI that complements kubectl for simplifying deployment and configuration applications on OpenShift.',
                params: [],
                steps: [
                  {
                    env: [],
                    image:
                      'image-registry.openshift-image-registry.svc:5000/openshift/cli:latest',
                    name: 'oc',
                    resources: {},
                    script: 'echo hi',
                    securityContext: {
                      runAsNonRoot: true,
                      runAsUser: 65532,
                    },
                  },
                ],
                workspaces: [],
              },
            },
          },
          'ruby-ex-git-xf45fo-fetch-repository': {
            pipelineTaskName: 'fetch-repository',
            status: {
              completionTime: '2023-03-30T07:03:20Z',
              conditions: [
                {
                  lastTransitionTime: '2023-03-30T07:03:20Z',
                  message: 'All Steps have completed executing',
                  reason: 'Succeeded',
                  status: 'Unknown',
                  type: 'Succeeded',
                },
              ],
              podName: 'ruby-ex-git-xf45fo-fetch-repository-pod',
              startTime: '2023-03-30T07:03:05Z',
              steps: [
                {
                  container: 'step-clone',
                  imageID:
                    'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                  name: 'clone',
                  terminated: {
                    containerID:
                      'cri-o://8937c0bc0cd043d09395b85bffee7010624f26d5345141ff988b618a60027e48',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:03:20Z',
                    message:
                      '[{"key":"commit","value":"01effef3a23935c1a83110d4b074b0738d677c44","type":1},{"key":"url","value":"https://github.com/sclorg/ruby-ex.git","type":1}]',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:03:20Z',
                  },
                },
              ],
              taskResults: [
                {
                  name: 'commit',
                  type: 'string',
                  value: '01effef3a23935c1a83110d4b074b0738d677c44',
                },
                {
                  name: 'url',
                  type: 'string',
                  value: 'https://github.com/sclorg/ruby-ex.git',
                },
              ],
              taskSpec: {
                description:
                  "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
                params: [
                  {
                    description: 'Repository URL to clone from.',
                    name: 'url',
                  },
                  {
                    default: '',
                    description:
                      'Revision to checkout. (branch, tag, sha, ref, etc...)',
                    name: 'revision',
                  },
                  {
                    default: '',
                    description:
                      'Refspec to fetch before checking out revision.',
                    name: 'refspec',
                  },
                  {
                    default: 'true',
                    description: 'Initialize and fetch git submodules.',
                    name: 'submodules',
                  },
                  {
                    default: '1',
                    description:
                      'Perform a shallow clone, fetching only the most recent N commits.',
                    name: 'depth',
                  },
                  {
                    default: 'true',
                    description:
                      'Set the `http.sslVerify` global git config. Setting this to `false` is not advised unless you are sure that you trust your git remote.',
                    name: 'sslVerify',
                  },
                  {
                    default: 'ca-bundle.crt',
                    description:
                      'file name of mounted crt using ssl-ca-directory workspace. default value is ca-bundle.crt.',
                    name: 'crtFileName',
                  },
                  {
                    default: '',
                    description:
                      'Subdirectory inside the `output` Workspace to clone the repo into.',
                    name: 'subdirectory',
                  },
                  {
                    default: '',
                    description:
                      'Define the directory patterns to match or exclude when performing a sparse checkout.',
                    name: 'sparseCheckoutDirectories',
                  },
                  {
                    default: 'true',
                    description:
                      'Clean out the contents of the destination directory if it already exists before cloning.',
                    name: 'deleteExisting',
                  },
                  {
                    default: '',
                    description: 'HTTP proxy server for non-SSL requests.',
                    name: 'httpProxy',
                  },
                  {
                    default: '',
                    description: 'HTTPS proxy server for SSL requests.',
                    name: 'httpsProxy',
                  },
                  {
                    default: '',
                    description: 'Opt out of proxying HTTP/HTTPS requests.',
                    name: 'noProxy',
                  },
                  {
                    default: 'true',
                    description:
                      "Log the commands that are executed during `git-clone`'s operation.",
                    name: 'verbose',
                  },
                  {
                    default:
                      'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                    description:
                      'The image providing the git-init binary that this Task runs.',
                    name: 'gitInitImage',
                  },
                  {
                    default: '/tekton/home',
                    description:
                      "Absolute path to the user's home directory.\n",
                    name: 'userHome',
                  },
                ],
                results: [
                  {
                    description:
                      'The precise commit SHA that was fetched by this Task.',
                    name: 'commit',
                    type: 'string',
                  },
                  {
                    description:
                      'The precise URL that was fetched by this Task.',
                    name: 'url',
                    type: 'string',
                  },
                ],
                steps: [
                  {
                    env: [],
                    image:
                      'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                    name: 'clone',
                    resources: {},
                    script: 'echo hi',
                    securityContext: {
                      runAsNonRoot: true,
                      runAsUser: 65532,
                    },
                  },
                ],
                workspaces: [],
              },
            },
          },
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipeline-test-wbvtlk',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
        creationTimestamp: new Date('2023-03-30T07:04:04Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:49:05Z',
            message: 'Tasks Completed: 4 (Failed: 3, Cancelled 0), Skipped: 0',
            reason: 'Failed',
            status: 'False',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          finally: [
            {
              name: 'git-clone',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'git-clone',
              },
              workspaces: [],
            },
          ],
          tasks: [
            {
              name: 'buildah',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'buildah',
              },
              workspaces: [],
            },
            {
              name: 'tkn',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'tkn',
              },
            },
            {
              name: 'argocd-task-sync-and-wait',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'argocd-task-sync-and-wait',
              },
            },
          ],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
          taskRuns: {
            'pipeline-test-wbvtlk-argocd-task-sync-and-wait': {
              pipelineTaskName: 'argocd-task-sync-and-wait',
              status: {
                conditions: [
                  {
                    lastTransitionTime: '2023-04-11T06:48:55Z',
                    message: 'Failed to create pod due to config error',
                    reason: 'CreateContainerConfigError',
                    status: 'False',
                    type: 'Succeeded',
                  },
                ],
                podName: 'pipeline-test-wbvtlk-argocd-task-sync-and-wait-pod',
                startTime: '2023-04-11T06:48:51Z',
                steps: [
                  {
                    container: 'step-login',
                    name: 'login',
                    waiting: {
                      message: 'configmap "argocd-env-configmap" not found',
                      reason: 'CreateContainerConfigError',
                    },
                  },
                ],
                taskSpec: {
                  description:
                    'This task syncs (deploys) an Argo CD application and waits for it to be healthy.\nTo do so, it requires the address of the Argo CD server and some form of authentication either a username/password or an authentication token.',
                  params: [],
                  stepTemplate: {
                    envFrom: [
                      {
                        configMapRef: {
                          name: 'argocd-env-configmap',
                        },
                      },
                      {
                        secretRef: {
                          name: 'argocd-env-secret',
                        },
                      },
                    ],
                    name: '',
                    resources: {},
                  },
                  steps: [
                    {
                      image: 'quay.io/argoproj/argocd:v2.2.2',
                      name: 'login',
                      resources: {},
                      script:
                        'if [ -z "$ARGOCD_AUTH_TOKEN" ]; then\n  yes | argocd login "$ARGOCD_SERVER" --username="$ARGOCD_USERNAME" --password="$ARGOCD_PASSWORD";\nfi\nargocd app sync "dw" --revision "HEAD" "--"\nargocd app wait "dw" --health "--"\n',
                    },
                  ],
                },
                reason: 'Cancelled',
              },
            },
            'pipeline-test-wbvtlk-buildah': {
              pipelineTaskName: 'buildah',
              status: {
                completionTime: '2023-04-11T06:48:58Z',
                conditions: [
                  {
                    lastTransitionTime: '2023-04-11T06:48:58Z',
                    message:
                      '"step-build-and-push" exited with code 125 (image: "registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d"); for logs run: kubectl -n deb-test logs pipeline-test-wbvtlk-buildah-pod -c step-build-and-push\n',
                    reason: 'Failed',
                    status: 'False',
                    type: 'Succeeded',
                  },
                ],
                podName: 'pipeline-test-wbvtlk-buildah-pod',
                startTime: '2023-04-11T06:48:50Z',
                steps: [
                  {
                    container: 'step-build-and-push',
                    imageID:
                      'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
                    name: 'build-and-push',
                    terminated: {
                      containerID:
                        'cri-o://42a5bb291a4cebe89ced1d95daf1aeb54873ec4f4203259ab94d5124fe3b01d0',
                      exitCode: 125,
                      finishedAt: '2023-04-11T06:48:57Z',
                      reason: 'Error',
                      startedAt: '2023-04-11T06:48:57Z',
                    },
                  },
                ],
                taskSpec: {
                  description:
                    "Buildah task builds source into a container image and then pushes it to a container registry.\nBuildah Task builds source into a container image using Project Atomic's Buildah build tool.It uses Buildah's support for building from Dockerfiles, using its buildah bud command.This command executes the directives in the Dockerfile to assemble a container image, then pushes that image to a container registry.",
                  params: [],
                  results: [
                    {
                      description: 'Digest of the image just built.',
                      name: 'IMAGE_DIGEST',
                      type: 'string',
                    },
                    {
                      description:
                        'Image repository where the built image would be pushed to',
                      name: 'IMAGE_URL',
                      type: 'string',
                    },
                  ],
                  steps: [
                    {
                      image:
                        'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
                      name: 'build-and-push',
                      resources: {},
                      script:
                        'buildah --storage-driver=vfs bud \\\n   --format=oci \\\n  --tls-verify=true --no-cache \\\n  -f ./Dockerfile -t openshift/hello-openshift .\n\n[[ "false" == "true" ]] && echo "Push skipped" && exit 0\n\nif [[ "true" == "true" ]]; then\n\n  # if config.json exists at workspace root, we use that\n  if test -f "/workspace/dockerconfig/config.json"; then\n    export DOCKER_CONFIG="/workspace/dockerconfig"\n\n  # else we look for .dockerconfigjson at the root\n  elif test -f "/workspace/dockerconfig/.dockerconfigjson"; then\n    cp "/workspace/dockerconfig/.dockerconfigjson" "$HOME/.docker/config.json"\n    export DOCKER_CONFIG="$HOME/.docker"\n\n  # need to error out if neither files are present\n  else\n    echo "neither \'config.json\' nor \'.dockerconfigjson\' found at workspace root"\n    exit 1\n  fi\nfi\n\nbuildah --storage-driver=vfs push \\\n   --tls-verify=true \\\n  --digestfile /tmp/image-digest openshift/hello-openshift \\\n  docker://openshift/hello-openshift\ncat /tmp/image-digest | tee /tekton/results/IMAGE_DIGEST\necho "openshift/hello-openshift" | tee /tekton/results/IMAGE_URL\n',
                      securityContext: {
                        capabilities: {
                          add: ['SETFCAP'],
                        },
                      },
                      volumeMounts: [
                        {
                          mountPath: '/var/lib/containers',
                          name: 'varlibcontainers',
                        },
                      ],
                      workingDir: '/workspace/source',
                    },
                  ],
                  volumes: [
                    {
                      emptyDir: {},
                      name: 'varlibcontainers',
                    },
                  ],
                  workspaces: [],
                },
              },
            },
            'pipeline-test-wbvtlk-git-clone': {
              pipelineTaskName: 'git-clone',
              status: {
                completionTime: '2023-04-11T06:49:05Z',
                conditions: [
                  {
                    lastTransitionTime: '2023-04-11T06:49:05Z',
                    message:
                      '"step-clone" exited with code 1 (image: "registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9"); for logs run: kubectl -n deb-test logs pipeline-test-wbvtlk-git-clone-pod -c step-clone\n',
                    reason: 'Failed',
                    status: 'False',
                    type: 'Succeeded',
                  },
                ],
                podName: 'pipeline-test-wbvtlk-git-clone-pod',
                startTime: '2023-04-11T06:48:58Z',
                steps: [
                  {
                    container: 'step-clone',
                    imageID:
                      'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                    name: 'clone',
                    terminated: {
                      containerID:
                        'cri-o://b727febb4b981471a5729cf6002d59d31673d25280192e7dc0ea09de113743dd',
                      exitCode: 1,
                      finishedAt: '2023-04-11T06:49:04Z',
                      reason: 'Error',
                      startedAt: '2023-04-11T06:49:04Z',
                    },
                  },
                ],
                taskSpec: {
                  description:
                    "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
                  params: [],
                  results: [
                    {
                      description:
                        'The precise commit SHA that was fetched by this Task.',
                      name: 'commit',
                      type: 'string',
                    },
                    {
                      description:
                        'The precise URL that was fetched by this Task.',
                      name: 'url',
                      type: 'string',
                    },
                  ],
                  steps: [
                    {
                      env: [
                        {
                          name: 'HOME',
                          value: '/tekton/home',
                        },
                        {
                          name: 'PARAM_URL',
                          value: 'https://xyz',
                        },
                        {
                          name: 'PARAM_REVISION',
                        },
                        {
                          name: 'PARAM_REFSPEC',
                        },
                        {
                          name: 'PARAM_SUBMODULES',
                          value: 'true',
                        },
                        {
                          name: 'PARAM_DEPTH',
                          value: '1',
                        },
                        {
                          name: 'PARAM_SSL_VERIFY',
                          value: 'true',
                        },
                        {
                          name: 'PARAM_CRT_FILENAME',
                          value: 'ca-bundle.crt',
                        },
                        {
                          name: 'PARAM_SUBDIRECTORY',
                        },
                        {
                          name: 'PARAM_DELETE_EXISTING',
                          value: 'true',
                        },
                        {
                          name: 'PARAM_HTTP_PROXY',
                        },
                        {
                          name: 'PARAM_HTTPS_PROXY',
                        },
                        {
                          name: 'PARAM_NO_PROXY',
                        },
                        {
                          name: 'PARAM_VERBOSE',
                          value: 'true',
                        },
                        {
                          name: 'PARAM_SPARSE_CHECKOUT_DIRECTORIES',
                        },
                        {
                          name: 'PARAM_USER_HOME',
                          value: '/tekton/home',
                        },
                        {
                          name: 'WORKSPACE_OUTPUT_PATH',
                          value: '/workspace/output',
                        },
                        {
                          name: 'WORKSPACE_SSH_DIRECTORY_BOUND',
                          value: 'false',
                        },
                        {
                          name: 'WORKSPACE_SSH_DIRECTORY_PATH',
                        },
                        {
                          name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND',
                          value: 'false',
                        },
                        {
                          name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_PATH',
                        },
                        {
                          name: 'WORKSPACE_SSL_CA_DIRECTORY_BOUND',
                          value: 'false',
                        },
                        {
                          name: 'WORKSPACE_SSL_CA_DIRECTORY_PATH',
                        },
                      ],
                      image:
                        'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                      name: 'clone',
                      resources: {},
                      script:
                        '#!/usr/bin/env sh\nset -eu\n\nif [ "${PARAM_VERBOSE}" = "true" ] ; then\n  set -x\nfi\n\n\nif [ "${WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.git-credentials" "${PARAM_USER_HOME}/.git-credentials"\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.gitconfig" "${PARAM_USER_HOME}/.gitconfig"\n  chmod 400 "${PARAM_USER_HOME}/.git-credentials"\n  chmod 400 "${PARAM_USER_HOME}/.gitconfig"\nfi\n\nif [ "${WORKSPACE_SSH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp -R "${WORKSPACE_SSH_DIRECTORY_PATH}" "${PARAM_USER_HOME}"/.ssh\n  chmod 700 "${PARAM_USER_HOME}"/.ssh\n  chmod -R 400 "${PARAM_USER_HOME}"/.ssh/*\nfi\n\nif [ "${WORKSPACE_SSL_CA_DIRECTORY_BOUND}" = "true" ] ; then\n   export GIT_SSL_CAPATH="${WORKSPACE_SSL_CA_DIRECTORY_PATH}"\n   if [ "${PARAM_CRT_FILENAME}" != "" ] ; then\n      export GIT_SSL_CAINFO="${WORKSPACE_SSL_CA_DIRECTORY_PATH}/${PARAM_CRT_FILENAME}"\n   fi\nfi\nCHECKOUT_DIR="${WORKSPACE_OUTPUT_PATH}/${PARAM_SUBDIRECTORY}"\n\ncleandir() {\n  # Delete any existing contents of the repo directory if it exists.\n  #\n  # We don\'t just "rm -rf ${CHECKOUT_DIR}" because ${CHECKOUT_DIR} might be "/"\n  # or the root of a mounted volume.\n  if [ -d "${CHECKOUT_DIR}" ] ; then\n    # Delete non-hidden files and directories\n    rm -rf "${CHECKOUT_DIR:?}"/*\n    # Delete files and directories starting with . but excluding ..\n    rm -rf "${CHECKOUT_DIR}"/.[!.]*\n    # Delete files and directories starting with .. plus any other character\n    rm -rf "${CHECKOUT_DIR}"/..?*\n  fi\n}\n\nif [ "${PARAM_DELETE_EXISTING}" = "true" ] ; then\n  cleandir\nfi\n\ntest -z "${PARAM_HTTP_PROXY}" || export HTTP_PROXY="${PARAM_HTTP_PROXY}"\ntest -z "${PARAM_HTTPS_PROXY}" || export HTTPS_PROXY="${PARAM_HTTPS_PROXY}"\ntest -z "${PARAM_NO_PROXY}" || export NO_PROXY="${PARAM_NO_PROXY}"\n\n/ko-app/git-init \\\n  -url="${PARAM_URL}" \\\n  -revision="${PARAM_REVISION}" \\\n  -refspec="${PARAM_REFSPEC}" \\\n  -path="${CHECKOUT_DIR}" \\\n  -sslVerify="${PARAM_SSL_VERIFY}" \\\n  -submodules="${PARAM_SUBMODULES}" \\\n  -depth="${PARAM_DEPTH}" \\\n  -sparseCheckoutDirectories="${PARAM_SPARSE_CHECKOUT_DIRECTORIES}"\ncd "${CHECKOUT_DIR}"\nRESULT_SHA="$(git rev-parse HEAD)"\nEXIT_CODE="$?"\nif [ "${EXIT_CODE}" != 0 ] ; then\n  exit "${EXIT_CODE}"\nfi\nprintf "%s" "${RESULT_SHA}" > "/tekton/results/commit"\nprintf "%s" "${PARAM_URL}" > "/tekton/results/url"\n',
                      securityContext: {
                        runAsNonRoot: true,
                        runAsUser: 65532,
                      },
                    },
                  ],
                  workspaces: [],
                },
              },
            },
            'pipeline-test-wbvtlk-tkn': {
              pipelineTaskName: 'tkn',
              status: {
                completionTime: '2023-04-11T06:48:56Z',
                conditions: [
                  {
                    lastTransitionTime: '2023-04-11T06:48:56Z',
                    message: 'All Steps have completed executing',
                    reason: 'Succeeded',
                    status: 'True',
                    type: 'Succeeded',
                  },
                ],
                podName: 'pipeline-test-wbvtlk-tkn-pod',
                startTime: '2023-04-11T06:48:50Z',
                steps: [
                  {
                    container: 'step-tkn',
                    imageID:
                      'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
                    name: 'tkn',
                    terminated: {
                      containerID:
                        'cri-o://53fbddbb25c08e97d0061a3dd79021e8d411485bbc3f18cfcffd41ae3448c0d2',
                      exitCode: 0,
                      finishedAt: '2023-04-11T06:48:56Z',
                      reason: 'Completed',
                      startedAt: '2023-04-11T06:48:56Z',
                    },
                  },
                ],
                taskSpec: {
                  description:
                    'This task performs operations on Tekton resources using tkn',
                  params: [],
                  steps: [
                    {
                      args: ['--help'],
                      env: [
                        {
                          name: 'HOME',
                          value: '/tekton/home',
                        },
                      ],
                      image:
                        'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
                      name: 'tkn',
                      resources: {},
                      script:
                        'if [ "false" = "true" ] && [ -e /kubeconfig ]; then\n  export KUBECONFIG=""/kubeconfig\nfi\n\neval "tkn $@"\n',
                      securityContext: {
                        runAsNonRoot: true,
                        runAsUser: 65532,
                      },
                    },
                  ],
                  workspaces: [],
                },
              },
            },
          },
        },
      },
    },
  ],
  taskruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash':
            '63911846cb698608618c9a280f25b886ea3ee59f84a4ef6da15738a699e09f0c',
          'pipeline.openshift.io/started-by': 'kube:admin',
          'pipeline.tekton.dev/release': '9ec444e',
          'tekton.dev/displayName': 's2i ruby',
          'tekton.dev/pipelines.minVersion': '0.19',
          'tekton.dev/tags': 's2i, ruby, workspace',
        },
        creationTimestamp: new Date('2023-03-30T07:03:20Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'ruby-ex-git',
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/name': 'ruby-ex-git',
          'app.kubernetes.io/version': '0.1',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/clusterTask': 's2i-ruby',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'ruby-ex-git',
          'tekton.dev/pipelineRun': 'ruby-ex-git-xf45fo',
          'tekton.dev/pipelineTask': 'build',
        },
        name: 'ruby-ex-git-xf45fo-build',
        namespace: 'jai-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'ruby-ex-git-xf45fo',
            uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
          },
        ],
        resourceVersion: '87287',
        uid: 'e8d42c4a-b9c7-4f56-9482-d17f2c861804',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 's2i-ruby',
        },
        timeout: '1h0m0s',
        workspaces: [],
      },
      status: {
        completionTime: '2023-03-30T07:04:55Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:04:55Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'Unknown',
            type: 'Succeeded',
          },
        ],
        podName: 'ruby-ex-git-xf45fo-build-pod',
        startTime: '2023-03-30T07:03:20Z',
        steps: [
          {
            container: 'step-generate',
            imageID:
              'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
            name: 'generate',
            terminated: {
              containerID:
                'cri-o://3b490fe8f5ed9310fa7b322961e2069b3548a6a8134693ef78c12c8c0760ea0c',
              exitCode: 0,
              finishedAt: '2023-03-30T07:03:30Z',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
          {
            container: 'step-build-and-push',
            imageID:
              'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
            name: 'build-and-push',
            terminated: {
              containerID:
                'cri-o://90521ea2114ca3fc6b54216fe8cff26b679788d1c87dee40b98caa90f71e140e',
              exitCode: 0,
              finishedAt: '2023-03-30T07:04:54Z',
              message:
                '[{"key":"IMAGE_DIGEST","value":"sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02","type":1}]',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
        ],
        taskResults: [
          {
            name: 'IMAGE_DIGEST',
            type: 'string',
            value:
              'sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02',
          },
        ],
        taskSpec: {
          description:
            's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
          params: [],
          results: [
            {
              description: 'Digest of the image just built.',
              name: 'IMAGE_DIGEST',
              type: 'string',
            },
          ],
          steps: [
            {
              env: [],
              image:
                'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
              name: 'generate',
              resources: {},
              script: 'echo',
              volumeMounts: [
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
                {
                  mountPath: '/env-vars',
                  name: 'env-vars',
                },
              ],
              workingDir: '/workspace/source',
            },
            {
              image:
                'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
              name: 'build-and-push',
              resources: {},
              script: 'echo',
              securityContext: {
                capabilities: {
                  add: ['SETFCAP'],
                },
              },
              volumeMounts: [
                {
                  mountPath: '/var/lib/containers',
                  name: 'varlibcontainers',
                },
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
              ],
              workingDir: '/gen-source',
            },
          ],
          volumes: [
            {
              emptyDir: {},
              name: 'varlibcontainers',
            },
            {
              emptyDir: {},
              name: 'gen-source',
            },
            {
              emptyDir: {},
              name: 'env-vars',
            },
          ],
          workspaces: [],
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash': 'undefined',
          'pipeline.openshift.io/started-by': 'undefined',
          'pipeline.tekton.dev/release': 'undefined',
          'tekton.dev/displayName': 'undefined',
          'tekton.dev/pipelines.minVersion': 'undefined',
          'tekton.dev/tags': 'undefined',
        },
        creationTimestamp: new Date('2023-04-11T06:48:50Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/version': '0.4',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'tekton.dev/clusterTask': 'tkn',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'pipeline-test',
          'tekton.dev/pipelineRun': 'pipeline-test-wbvtlk',
          'tekton.dev/pipelineTask': 'tkn',
          'app.kubernetes.io/instance': 'xyz',
          'app.kubernetes.io/name': 'xyz',
          'pipeline.openshift.io/runtime': 'node',
          'pipeline.openshift.io/runtime-version': 'gh',
          'pipeline.openshift.io/type': 'abc',
        },
        name: 'pipeline-test-wbvtlk-tkn',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'pipeline-test-wbvtlk',
            uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
          },
        ],
        resourceVersion: '117189',
        uid: 'cb08cb7d-71fc-48a7-888f-4ad14a7277b9',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 'tkn',
        },
        timeout: '1h0m0s',
      },
      status: {
        completionTime: '2023-04-11T06:48:56Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:48:56Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        podName: 'pipeline-test-wbvtlk-tkn-pod',
        startTime: '2023-04-11T06:48:50Z',
        steps: [
          {
            container: 'step-tkn',
            imageID:
              'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
            name: 'tkn',
            terminated: {
              containerID:
                'cri-o://53fbddbb25c08e97d0061a3dd79021e8d411485bbc3f18cfcffd41ae3448c0d2',
              exitCode: 0,
              finishedAt: '2023-04-11T06:48:56Z',
              reason: 'Completed',
              startedAt: '2023-04-11T06:48:56Z',
            },
          },
        ],
        taskSpec: {
          description:
            'This task performs operations on Tekton resources using tkn',
          params: [],
          steps: [
            {
              args: ['--help'],
              env: [
                {
                  name: 'HOME',
                  value: '/tekton/home',
                },
              ],
              image:
                'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
              name: 'tkn',
              resources: {},
              script:
                'if [ "false" = "true" ] && [ -e /kubeconfig ]; then\n  export KUBECONFIG=""/kubeconfig\nfi\n\neval "tkn $@"\n',
              securityContext: {
                runAsNonRoot: true,
                runAsUser: 65532,
              },
            },
          ],
          workspaces: [],
        },
      },
    },
  ],
  pipelines: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'Pipeline',
      metadata: {
        creationTimestamp: new Date('2023-06-14T09:57:09Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'test-deployment',
          'app.kubernetes.io/name': 'test-deployment',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'pipeline.openshift.io/runtime': 'nodejs',
          'pipeline.openshift.io/runtime-version': '16-ubi8',
          'pipeline.openshift.io/type': 'kubernetes',
        },
        name: 'test-deployment',
        namespace: 'deb-test',
        resourceVersion: '247024',
        uid: 'b1585bb1-ff97-46e7-8b11-03e8c477c86a',
      },
      spec: {
        params: [],
        tasks: [
          {
            name: 'fetch-repository',
            params: [
              {
                name: 'url',
                value: '$(params.GIT_REPO)',
              },
              {
                name: 'revision',
                value: '$(params.GIT_REVISION)',
              },
              {
                name: 'subdirectory',
                value: '',
              },
              {
                name: 'deleteExisting',
                value: 'true',
              },
            ],
            taskRef: {
              kind: 'ClusterTask',
              name: 'git-clone',
            },
            workspaces: [],
          },
          {
            name: 'build',
            params: [],
            runAfter: ['fetch-repository'],
            taskRef: {
              kind: 'ClusterTask',
              name: 's2i-nodejs',
            },
            workspaces: [],
          },
          {
            name: 'deploy',
            params: [],
            runAfter: ['build'],
            taskRef: {
              kind: 'ClusterTask',
              name: 'openshift-client',
            },
          },
        ],
        workspaces: [],
      },
    },
  ],
};
