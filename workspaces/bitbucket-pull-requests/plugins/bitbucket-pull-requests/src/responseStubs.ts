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
  values: [
    {
      id: 1,
      title: 'Update README',
      description: 'This PR updates the README file with new instructions.',
      state: 'OPEN',
      created_on: '2024-06-15T12:34:56.000Z',
      updated_on: '2024-06-16T12:34:56.000Z',
      source: {
        branch: {
          name: 'feature/update-readme',
        },
        commit: {
          hash: 'abc123',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      destination: {
        branch: {
          name: 'main',
        },
        commit: {
          hash: 'def456',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      author: {
        display_name: 'John Doe',
        uuid: '{user-uuid}',
        links: {
          avatar: {
            href: 'https://bitbucket.org/account/johndoe/avatar/32/',
          },
        },
      },
      reviewers: [
        {
          display_name: 'Jane Smith',
          uuid: '{reviewer-uuid}',
          approved: false,
          links: {
            avatar: {
              href: 'https://bitbucket.org/account/janesmith/avatar/32/',
            },
          },
        },
      ],
      links: {
        self: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/1',
        },
        html: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/1',
        },
      },
    },
    {
      id: 2,
      title: 'Add new feature',
      description: 'This PR adds a new feature.',
      state: 'MERGED',
      created_on: '2024-06-18T12:00:00.000Z',
      updated_on: '2024-06-20T12:00:00.000Z',
      source: {
        branch: {
          name: 'feature/new-feature',
        },
        commit: {
          hash: 'ghi789',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      destination: {
        branch: {
          name: 'main',
        },
        commit: {
          hash: 'jkl012',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      author: {
        display_name: 'John Doe',
        uuid: '{user-uuid}',
        links: {
          avatar: {
            href: 'https://bitbucket.org/account/johndoe/avatar/32/',
          },
        },
      },
      reviewers: [
        {
          display_name: 'Jane Smith',
          uuid: '{reviewer-uuid}',
          approved: true,
          links: {
            avatar: {
              href: 'https://bitbucket.org/account/janesmith/avatar/32/',
            },
          },
        },
      ],
      links: {
        self: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/2',
        },
        html: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/2',
        },
      },
    },
    {
      id: 3,
      title: 'Fix bug in feature',
      description: 'This PR fixes a bug in the new feature.',
      state: 'DECLINED',
      created_on: '2024-06-19T12:00:00.000Z',
      updated_on: '2024-06-20T12:00:00.000Z',
      source: {
        branch: {
          name: 'bugfix/fix-bug',
        },
        commit: {
          hash: 'mno345',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      destination: {
        branch: {
          name: 'main',
        },
        commit: {
          hash: 'pqr678',
        },
        repository: {
          name: 'my-repo',
          full_name: 'my-team/my-repo',
        },
      },
      author: {
        display_name: 'John Doe',
        uuid: '{user-uuid}',
        links: {
          avatar: {
            href: 'https://bitbucket.org/account/johndoe/avatar/32/',
          },
        },
      },
      reviewers: [
        {
          display_name: 'Jane Smith',
          uuid: '{reviewer-uuid}',
          approved: false,
          links: {
            avatar: {
              href: 'https://bitbucket.org/account/janesmith/avatar/32/',
            },
          },
        },
      ],
      links: {
        self: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/3',
        },
        html: {
          href: 'https://bitbucket.org/my-team/my-repo/pull-requests/3',
        },
      },
    },
  ],
  page: 1,
  pagelen: 10,
  size: 3,
};
