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
interface Release {
  targetCommitish: string;
  tagName: string;
  prerelease: boolean;
  id: number;
  htmlUrl: string;
  name: string | null;
  createdAt: string | null;
  body?: string | null;
}

interface Repository {
  pushPermissions: boolean | undefined;
  defaultBranch: string;
  name: string;
}

interface User {
  username: string;
  email?: string;
}

interface Commit {
  htmlUrl: string;
  sha: string;
  author: {
    htmlUrl?: string | undefined;
    login?: string | undefined;
  };
  commit: { message: string };
  firstParentSha?: string | undefined;
}

interface Branch {
  name: string;
  links: {
    html: string;
  };
  commit: {
    sha: string;
    commit: {
      tree: {
        sha: string;
      };
    };
  };
  commits: Record<string, Commit>;
}

interface Tag {
  tagName: string;
  tagSha: string;
  tagType: 'tag' | 'commit';
  info: {
    date: string;
    username: string;
    userEmail: string;
    objectSha: string;
  };
}

export interface OwnerData {
  user: User;
  repositories: Record<
    string,
    {
      info: Repository;
      releases: Record<string, Release>;
      branches: Record<string, Branch>;
      tags: Record<string, Tag>;
    }
  >;
}
