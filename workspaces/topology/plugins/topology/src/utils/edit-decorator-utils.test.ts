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
import {
  getCheDecoratorData,
  getEditURL,
  getFullGitURL,
} from './edit-decorator-utils';

describe('getCheDecoratorData', () => {
  it('should return undefined if cheCluster is undefined', () => {
    const result = getCheDecoratorData();
    expect(result).toBeUndefined();
  });

  it('should return cheURL if it exists in the cheCluster object', () => {
    const cheCluster = { status: { cheURL: 'https://example.com' } };
    const result = getCheDecoratorData(cheCluster);
    expect(result).toBe('https://example.com');
  });

  it('should return undefined if cheURL does not exist in the cheCluster object', () => {
    const cheCluster = { status: { cheURL: '' } };
    const result = getCheDecoratorData(cheCluster);
    expect(result).toBe('');
  });
});

describe('getFullGitURL', () => {
  it('should return baseUrl if branch is undefined', () => {
    const gitUrl: any = { resource: 'github.com', owner: 'user', name: 'repo' };
    const result = getFullGitURL(gitUrl);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should return baseUrl with branch for GitHub', () => {
    const gitUrl: any = { resource: 'github.com', owner: 'user', name: 'repo' };
    const result = getFullGitURL(gitUrl, 'branch');
    expect(result).toBe('https://github.com/user/repo/tree/branch');
  });

  it('should return baseUrl with branch for GitLab', () => {
    const gitUrl: any = { resource: 'gitlab.com', owner: 'user', name: 'repo' };
    const result = getFullGitURL(gitUrl, 'branch');
    expect(result).toBe('https://gitlab.com/user/repo/-/tree/branch');
  });

  it('should return baseUrl with branch for Bitbucket when branch does not contain "/"', () => {
    const gitUrl: any = {
      resource: 'bitbucket.org',
      owner: 'user',
      name: 'repo',
    };
    const result = getFullGitURL(gitUrl, 'branch');
    expect(result).toBe('https://bitbucket.org/user/repo/src/branch');
  });

  it('should return baseUrl if branch contains "/" for Bitbucket', () => {
    const gitUrl: any = {
      resource: 'bitbucket.org',
      owner: 'user',
      name: 'repo',
    };
    const result = getFullGitURL(gitUrl, 'feature/branch');
    expect(result).toBe('https://bitbucket.org/user/repo');
  });
});

describe('getEditURL', () => {
  it('should return null if vcsURI is undefined', () => {
    const result = getEditURL();
    expect(result).toBeNull();
  });

  it('should return fullGitURL if cheURL is undefined', () => {
    const vcsURI = 'https://github.com/user/repo';
    const result = getEditURL(vcsURI);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should return cheURL with fullGitURL as a query parameter', () => {
    const vcsURI = 'https://github.com/user/repo';
    const cheURL = 'https://che.example.com';
    const result = getEditURL(vcsURI, undefined, cheURL);
    expect(result).toBe(
      'https://che.example.com/f?url=https://github.com/user/repo&policies.create=peruser',
    );
  });

  it('should return fullGitURL with branch if cheURL is undefined', () => {
    const vcsURI = 'https://github.com/user/repo';
    const gitBranch = 'branch';
    const result = getEditURL(vcsURI, gitBranch);
    expect(result).toBe('https://github.com/user/repo/tree/branch');
  });

  it('should return cheURL with fullGitURL and branch as query parameters', () => {
    const vcsURI = 'https://github.com/user/repo';
    const gitBranch = 'branch';
    const cheURL = 'https://che.example.com';
    const result = getEditURL(vcsURI, gitBranch, cheURL);
    expect(result).toBe(
      'https://che.example.com/f?url=https://github.com/user/repo/tree/branch&policies.create=peruser',
    );
  });
});
