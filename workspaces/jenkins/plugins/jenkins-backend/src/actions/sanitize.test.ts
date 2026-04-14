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

import { sanitizeBuild, sanitizeProject } from './sanitize';
import type { BackstageBuild, BackstageProject } from '../types';

const baseBuild: BackstageBuild = {
  building: false,
  displayName: '#7',
  duration: 5000,
  fullDisplayName: 'my-job #7',
  number: 7,
  result: 'SUCCESS',
  timestamp: 1700000000,
  url: 'https://jenkins.example.com/job/my-job/7',
  status: 'success',
  source: {
    branchName: 'main',
    displayName: 'feat: stuff',
    url: 'https://github.com/org/repo/pull/1',
    commit: { hash: 'abc123' },
    author: 'dev',
  },
  tests: {
    passed: 10,
    skipped: 1,
    failed: 0,
    total: 11,
    testUrl: 'https://jenkins.example.com/job/my-job/7/testReport/',
  },
  // fields that should be stripped
  actions: [{ _class: 'hudson.model.CauseAction' }],
} as any;

describe('sanitizeBuild', () => {
  it('should keep only the expected fields', () => {
    const result = sanitizeBuild(baseBuild);

    expect(result).toEqual({
      building: false,
      displayName: '#7',
      duration: 5000,
      fullDisplayName: 'my-job #7',
      number: 7,
      result: 'SUCCESS',
      timestamp: 1700000000,
      url: 'https://jenkins.example.com/job/my-job/7',
      status: 'success',
      source: baseBuild.source,
    });
  });

  it('should strip actions and tests', () => {
    const result = sanitizeBuild(baseBuild);

    expect(result).not.toHaveProperty('actions');
    expect(result).not.toHaveProperty('tests');
  });
});

describe('sanitizeProject', () => {
  const baseProject: BackstageProject = {
    displayName: 'my-build',
    fullDisplayName: 'my-job » my-build',
    fullName: 'my-job/my-build',
    inQueue: false,
    status: 'success',
    lastBuild: baseBuild,
    // fields that should be stripped
    actions: [{ _class: 'internal' }],
  } as any;

  it('should keep only the expected fields', () => {
    const result = sanitizeProject(baseProject);

    expect(result).toEqual({
      name: undefined,
      displayName: 'my-build',
      fullDisplayName: 'my-job » my-build',
      fullName: 'my-job/my-build',
      url: undefined,
      inQueue: false,
      status: 'success',
      lastBuild: sanitizeBuild(baseBuild),
    });
  });

  it('should strip actions from project', () => {
    const result = sanitizeProject(baseProject);
    expect(result).not.toHaveProperty('actions');
  });

  it('should handle null lastBuild', () => {
    const result = sanitizeProject({ ...baseProject, lastBuild: null });
    expect(result.lastBuild).toBeNull();
  });

  it('should pass through name and url when present', () => {
    const withExtras = {
      ...baseProject,
      name: 'proj-name',
      url: 'https://jenkins.example.com/job/my-job',
    } as any;

    const result = sanitizeProject(withExtras);
    expect(result.name).toBe('proj-name');
    expect(result.url).toBe('https://jenkins.example.com/job/my-job');
  });
});
