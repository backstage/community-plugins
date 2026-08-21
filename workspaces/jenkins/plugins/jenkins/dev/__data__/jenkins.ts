/*
 * Copyright 2026 The Backstage Authors
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

import { JenkinsApi, Project } from '../../src/api';

const lastBuild = {
  timestamp: Date.now() - 60 * 60 * 1000,
  building: false,
  duration: 120000,
  result: 'SUCCESS',
  fullDisplayName: 'folder-name/project-name #42',
  displayName: '#42',
  url: 'https://jenkins.example.com/job/folder-name/job/project-name/42/',
  number: 42,
  source: {
    branchName: 'main',
    displayName: 'main',
    url: 'https://github.com/backstage/backstage/tree/main',
    commit: {
      hash: 'a1b2c3d',
    },
    author: 'guest',
  },
  tests: {
    passed: 10,
    skipped: 0,
    failed: 0,
    total: 10,
    testUrl:
      'https://jenkins.example.com/job/folder-name/job/project-name/42/testReport',
  },
  status: 'success',
};

const mockProjects: Project[] = [
  {
    lastBuild,
    displayName: 'project-name',
    fullDisplayName: 'folder-name/project-name',
    fullName: 'folder-name/project-name',
    inQueue: '',
    status: 'success',
    onRestartClick: async () => {},
  },
];

export class MockJenkinsApi implements JenkinsApi {
  async getProjects() {
    return mockProjects;
  }

  async getBuild() {
    return lastBuild;
  }

  async getBuildConsoleText() {
    return { consoleText: 'Finished: SUCCESS' };
  }

  async getJobBuilds() {
    return {
      name: 'project-name',
      displayName: 'project-name',
      description: 'Example Jenkins job',
      fullDisplayName: 'folder-name/project-name',
      inQueue: false,
      fullName: 'folder-name/project-name',
      url: 'https://jenkins.example.com/job/folder-name/job/project-name/',
      builds: [
        {
          timestamp: lastBuild.timestamp,
          building: false,
          duration: lastBuild.duration,
          result: 'SUCCESS',
          fullDisplayName: lastBuild.fullDisplayName,
          displayName: lastBuild.displayName,
          url: lastBuild.url,
          number: lastBuild.number,
          inProgress: false,
          queueId: 1,
          id: lastBuild.number,
        },
      ],
    };
  }

  async retry() {}
}
