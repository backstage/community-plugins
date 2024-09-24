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
import { OwnerData } from './types';

const DATA: Record<string, OwnerData> = {
  goodreleaser: {
    user: {
      username: 'goodreleaser',
      email: 'goodreleaser@backstage.io',
    },
    repositories: {
      'repo-semantic-versioned': {
        info: {
          pushPermissions: true,
          defaultBranch: 'main',
          name: 'repo-semantic-versioned',
        },
        releases: {
          'rc-1.1.0': {
            targetCommitish: 'rc-1.1.0',
            tagName: 'rc-1.1.0',
            prerelease: true,
            id: 3,
            htmlUrl: 'http://mock-url',
            name: 'rc-1.1.0',
            createdAt: '2024-01-01',
            body: 'Minor fixes',
          },
          'version-1.0.0': {
            targetCommitish: 'version-1.0.0',
            tagName: 'version-1.0.0',
            prerelease: false,
            id: 2,
            htmlUrl: 'http://mock-url',
            name: 'version-1.0.0',
            createdAt: '2023-12-01',
            body: 'First version finally',
          },
          'rc-1.0.0': {
            targetCommitish: 'rc-1.0.0',
            tagName: 'rc-1.0.0',
            prerelease: true,
            id: 1,
            htmlUrl: 'http://mock-url',
            name: 'rc-1.0.0',
            createdAt: '2023-11-28',
            body: 'First version finally',
          },
        },
        branches: {
          'rc-1.1.0': {
            commit: {
              commit: {
                tree: {
                  sha: '456',
                },
              },
              sha: '456',
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'rc-1.1.0',
            commits: {
              '456': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '456',
                author: { login: 'user1' },
                commit: { message: 'fix: 1.1.0' },
                firstParentSha: '345',
              },
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 1.0.0' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 1.0.0' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
          },
          'version-1.0.0': {
            commit: {
              commit: {
                tree: {
                  sha: '345',
                },
              },
              sha: '345',
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'version-1.0.0',
            commits: {
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 1.0.0' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 1.0.0' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
          },
          'rc-1.0.0': {
            commit: {
              commit: {
                tree: {
                  sha: '234',
                },
              },
              sha: '234',
            },
            commits: {
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 1.0.0' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'rc-1.0.0',
          },
          main: {
            commit: {
              commit: {
                tree: {
                  sha: '123',
                },
              },
              sha: '123',
            },
            commits: {
              '567': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '567',
                author: { login: 'user1' },
                commit: { message: 'new on main' },
                firstParentSha: '345',
              },
              '456': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '456',
                author: { login: 'user1' },
                commit: { message: 'fix: 1.1.0' },
                firstParentSha: '345',
              },
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 1.0.0' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 1.0.0' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'main',
          },
        },
        tags: {
          'rc-1.1.0': {
            tagName: 'rc-1.1.0',
            tagSha: 'rc-1.1.0',
            tagType: 'tag',
            info: {
              date: '2024-01-01',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '456',
            },
          },
          'version-1.0.0': {
            tagName: 'version-1.0.0',
            tagSha: 'version-1.0.0',
            tagType: 'tag',
            info: {
              date: '2023-12-01',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '345',
            },
          },
          'rc-1.0.0': {
            tagName: 'rc-1.0.0',
            tagSha: 'rc-1.0.0',
            tagType: 'tag',
            info: {
              date: '2023-11-28',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '234',
            },
          },
        },
      },
      'repo-calendar-versioned': {
        info: {
          pushPermissions: true,
          defaultBranch: 'main',
          name: 'repo-calendar-versioned',
        },
        releases: {
          'rc-2024.01.01_0': {
            targetCommitish: 'rc-2024.01.01_0',
            tagName: 'rc-2024.01.01_0',
            prerelease: true,
            id: 3,
            htmlUrl: 'http://mock-url',
            name: 'rc-2024.01.01_0',
            createdAt: '2024-01-01',
            body: 'Minor fixes',
          },
          'version-2023.12.01_0': {
            targetCommitish: 'version-2023.12.01_0',
            tagName: 'version-2023.12.01_0',
            prerelease: false,
            id: 2,
            htmlUrl: 'http://mock-url',
            name: 'version-2023.12.01_0',
            createdAt: '2023-12-01',
            body: 'First version finally',
          },
          'rc-2023.12.01_0': {
            targetCommitish: 'rc-2023.12.01_0',
            tagName: 'rc-2023.12.01_0',
            prerelease: true,
            id: 1,
            htmlUrl: 'http://mock-url',
            name: 'rc-2023.12.01_0',
            createdAt: '2023-11-28',
            body: 'First version finally',
          },
        },
        branches: {
          'rc-2024.01.01_0': {
            commit: {
              commit: {
                tree: {
                  sha: '456',
                },
              },
              sha: '456',
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'rc-2024.01.01_0',
            commits: {
              '456': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '456',
                author: { login: 'user1' },
                commit: { message: 'fix: 2024-01-01' },
                firstParentSha: '345',
              },
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 2023-12-01' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 2023-12-01' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
          },
          'version-2023.12.01_0': {
            commit: {
              commit: {
                tree: {
                  sha: '345',
                },
              },
              sha: '345',
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'version-2023.12.01_0',
            commits: {
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 2023-12-01' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 2023-12-01' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
          },
          'rc-2023.12.01_0': {
            commit: {
              commit: {
                tree: {
                  sha: '234',
                },
              },
              sha: '234',
            },
            commits: {
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 2023-12-01' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'rc-2023.12.01_0',
          },
          main: {
            commit: {
              commit: {
                tree: {
                  sha: '123',
                },
              },
              sha: '123',
            },
            commits: {
              '567': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '567',
                author: { login: 'user1' },
                commit: { message: 'new on main' },
                firstParentSha: '345',
              },
              '456': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '456',
                author: { login: 'user1' },
                commit: { message: 'fix: 2024-01-01' },
                firstParentSha: '345',
              },
              '345': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '345',
                author: { login: 'user1' },
                commit: { message: 'ready 2023-12-01' },
                firstParentSha: '234',
              },
              '234': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '234',
                author: { login: 'user1' },
                commit: { message: 'prepare 2023-12-01' },
                firstParentSha: '123',
              },
              '123': {
                htmlUrl: 'https://mock_branch_links_html',
                sha: '123',
                author: { login: 'user1' },
                commit: { message: 'initial commit' },
              },
            },
            links: {
              html: 'https://mock_branch_links_html',
            },
            name: 'main',
          },
        },
        tags: {
          'rc-2024.01.01_0': {
            tagName: 'rc-2024.01.01_0',
            tagSha: 'rc-2024.01.01_0',
            tagType: 'tag',
            info: {
              date: '2024-01-01',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '456',
            },
          },
          'version-2023.12.01_0': {
            tagName: 'version-2023.12.01_0',
            tagSha: 'version-2023.12.01_0',
            tagType: 'tag',
            info: {
              date: '2023-12-01',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '345',
            },
          },
          'rc-2023.12.01_0': {
            tagName: 'rc-2023.12.01_0',
            tagSha: 'rc-2023.12.01_0',
            tagType: 'tag',
            info: {
              date: '2023-11-28',
              username: 'user1',
              userEmail: 'user1@mock.com',
              objectSha: '234',
            },
          },
        },
      },
    },
  },
};

export default DATA;
