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

export const entityStub = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage3.yaml',
      'bitbucket.com/project-slug': 'testproject/testrepo',
    },
    name: 'sample-bitbucketpr-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-bitbucketpr-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'guest@backstage.io',
    lifecycle: 'experimental',
  },
};
export const pullRequestsResponseStub = {
  size: 4,
  limit: 25,
  isLastPage: true,
  values: [
    {
      id: 712,
      version: 17,
      title: 'Feature implementation for homepage',
      description:
        '* install the plugin\n* plugin customisation\n* add the home page card\n* add custom changes\n* add prompts',
      state: 'OPEN',
      open: true,
      closed: false,
      draft: true,
      createdDate: 1755776870558,
      updatedDate: 1756441122639,
      fromRef: {
        id: 'refs/heads/feature-homepage',
        displayId: 'feature-homepage',
        latestCommit: 'e4082d48d2a0658cf58e64cd4a18dda03068e909',
        type: 'BRANCH',
        repository: {
          slug: 'example-project',
          id: 12257,
          name: 'example-project',
          hierarchyId: 'd4fa1fd449795cf37c5f',
          scmId: 'git',
          state: 'AVAILABLE',
          statusMessage: 'Available',
          forkable: true,
          project: {
            key: 'EXAMPLE',
            id: 9072,
            name: 'Example Project',
            description: 'This is an example project description',
            public: false,
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/projects/EXAMPLE',
                },
              ],
            },
          },
          public: false,
          archived: false,
          links: {
            clone: [
              {
                href: 'https://bitbucket.example.com/scm/example/example-project.git',
                name: 'http',
              },
              {
                href: 'ssh://git@bitbucket.example.com:7999/example/example-project.git',
                name: 'ssh',
              },
            ],
            self: [
              {
                href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/browse',
              },
            ],
          },
        },
      },
      toRef: {
        id: 'refs/heads/main',
        displayId: 'main',
        latestCommit: '133ff72b24434c7caa24913e64e2908377b65d64',
        type: 'BRANCH',
        repository: {
          slug: 'example-project',
          id: 12257,
          name: 'example-project',
          hierarchyId: 'd4fa1fd449795cf37c5f',
          scmId: 'git',
          state: 'AVAILABLE',
          statusMessage: 'Available',
          forkable: true,
          project: {
            key: 'EXAMPLE',
            id: 9072,
            name: 'Example Project',
            description: 'This is an example project description',
            public: false,
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/projects/EXAMPLE',
                },
              ],
            },
          },
          public: false,
          archived: false,
          links: {
            clone: [
              {
                href: 'https://bitbucket.example.com/scm/example/example-project.git',
                name: 'http',
              },
              {
                href: 'ssh://git@bitbucket.example.com:7999/example/example-project.git',
                name: 'ssh',
              },
            ],
            self: [
              {
                href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/browse',
              },
            ],
          },
        },
      },
      locked: false,
      author: {
        user: {
          name: 'user1',
          emailAddress: 'user1@example.com',
          active: true,
          displayName: 'Example User 1',
          id: 2173,
          slug: 'user1',
          type: 'NORMAL',
          links: {
            self: [
              {
                href: 'https://bitbucket.example.com/users/user1',
              },
            ],
          },
        },
        role: 'AUTHOR',
        approved: false,
        status: 'UNAPPROVED',
      },
      reviewers: [
        {
          user: {
            name: 'user2',
            emailAddress: 'user2@example.com',
            active: true,
            displayName: 'Example User 2',
            id: 1860,
            slug: 'user2',
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/users/user2',
                },
              ],
            },
          },
          role: 'REVIEWER',
          approved: false,
          status: 'UNAPPROVED',
        },
        {
          user: {
            name: 'user3',
            emailAddress: 'user3@example.com',
            active: true,
            displayName: 'Example User 3',
            id: 7151,
            slug: 'user3',
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/users/user3',
                },
              ],
            },
          },
          role: 'REVIEWER',
          approved: false,
          status: 'UNAPPROVED',
        },
      ],
      participants: [
        {
          user: {
            name: 'service-user',
            emailAddress: '',
            active: true,
            displayName: 'Service User',
            id: 19196,
            slug: 'service-user',
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/users/service-user',
                },
              ],
            },
          },
          role: 'PARTICIPANT',
          approved: false,
          status: 'UNAPPROVED',
        },
      ],
      properties: {
        mergeResult: {
          outcome: 'CONFLICTED',
          current: true,
        },
        resolvedTaskCount: 0,
        commentCount: 1,
        openTaskCount: 0,
      },
      links: {
        self: [
          {
            href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/pull-requests/712',
          },
        ],
      },
    },
    {
      id: 662,
      version: 52,
      title: 'Feature/PROJ-255 new template implementation',
      description: 'new template for the project',
      state: 'OPEN',
      open: true,
      closed: false,
      draft: false,
      createdDate: 1751004936553,
      updatedDate: 1756127376779,
      fromRef: {
        id: 'refs/heads/feature/PROJ-255-new-template',
        displayId: 'feature/PROJ-255-new-template',
        latestCommit: '45b7853f48dfbf958201b99933eb5884e1ce550f',
        type: 'BRANCH',
        repository: {
          slug: 'example-project',
          id: 12257,
          name: 'example-project',
          hierarchyId: 'd4fa1fd449795cf37c5f',
          scmId: 'git',
          state: 'AVAILABLE',
          statusMessage: 'Available',
          forkable: true,
          project: {
            key: 'EXAMPLE',
            id: 9072,
            name: 'Example Project',
            description: 'This is an example project description',
            public: false,
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/projects/EXAMPLE',
                },
              ],
            },
          },
          public: false,
          archived: false,
          links: {
            clone: [
              {
                href: 'https://bitbucket.example.com/scm/example/example-project.git',
                name: 'http',
              },
              {
                href: 'ssh://git@bitbucket.example.com:7999/example/example-project.git',
                name: 'ssh',
              },
            ],
            self: [
              {
                href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/browse',
              },
            ],
          },
        },
      },
      toRef: {
        id: 'refs/heads/main',
        displayId: 'main',
        latestCommit: '133ff72b24434c7caa24913e64e2908377b65d64',
        type: 'BRANCH',
        repository: {
          slug: 'example-project',
          id: 12257,
          name: 'example-project',
          hierarchyId: 'd4fa1fd449795cf37c5f',
          scmId: 'git',
          state: 'AVAILABLE',
          statusMessage: 'Available',
          forkable: true,
          project: {
            key: 'EXAMPLE',
            id: 9072,
            name: 'Example Project',
            description: 'This is an example project description',
            public: false,
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/projects/EXAMPLE',
                },
              ],
            },
          },
          public: false,
          archived: false,
          links: {
            clone: [
              {
                href: 'https://bitbucket.example.com/scm/example/example-project.git',
                name: 'http',
              },
              {
                href: 'ssh://git@bitbucket.example.com:7999/example/example-project.git',
                name: 'ssh',
              },
            ],
            self: [
              {
                href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/browse',
              },
            ],
          },
        },
      },
      locked: false,
      author: {
        user: {
          name: 'user4',
          emailAddress: 'user4@example.com',
          active: true,
          displayName: 'Example User 4',
          id: 16498,
          slug: 'user4',
          type: 'NORMAL',
          links: {
            self: [
              {
                href: 'https://bitbucket.example.com/users/user4',
              },
            ],
          },
        },
        role: 'AUTHOR',
        approved: false,
        status: 'UNAPPROVED',
      },
      reviewers: [
        {
          user: {
            name: 'user5',
            emailAddress: 'user5@example.com',
            active: true,
            displayName: 'Example User 5',
            id: 1643,
            slug: 'user5',
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/users/user5',
                },
              ],
            },
          },
          role: 'REVIEWER',
          approved: false,
          status: 'UNAPPROVED',
        },
      ],
      participants: [
        {
          user: {
            name: 'service-user',
            emailAddress: '',
            active: true,
            displayName: 'Service User',
            id: 19196,
            slug: 'service-user',
            type: 'NORMAL',
            links: {
              self: [
                {
                  href: 'https://bitbucket.example.com/users/service-user',
                },
              ],
            },
          },
          role: 'PARTICIPANT',
          approved: false,
          status: 'UNAPPROVED',
        },
      ],
      properties: {
        mergeResult: {
          outcome: 'CONFLICTED',
          current: true,
        },
        resolvedTaskCount: 0,
        commentCount: 26,
        openTaskCount: 0,
      },
      links: {
        self: [
          {
            href: 'https://bitbucket.example.com/projects/EXAMPLE/repos/example-project/pull-requests/662',
          },
        ],
      },
    },
  ],
  start: 0,
};
