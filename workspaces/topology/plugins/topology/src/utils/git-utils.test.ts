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
import { detectGitType, GitProvider, hasDomain } from './git-utils';

describe('hasDomain', () => {
  it('should return true if URL starts with https://domain/', () => {
    expect(hasDomain('https://github.com/user/repo', 'github.com')).toBe(true);
    expect(hasDomain('https://bitbucket.org/user/repo', 'bitbucket.org')).toBe(
      true,
    );
  });

  it('should return true if URL starts with https://www.domain/', () => {
    expect(hasDomain('https://www.github.com/user/repo', 'github.com')).toBe(
      true,
    );
  });

  it('should return true if URL contains @domain:', () => {
    expect(hasDomain('git@github.com:user/repo.git', 'github.com')).toBe(true);
    expect(hasDomain('git@bitbucket.org:user/repo.git', 'bitbucket.org')).toBe(
      true,
    );
  });

  it('should return false for other cases', () => {
    expect(hasDomain('https://example.com', 'github.com')).toBe(false);
    expect(hasDomain('https://www.example.com', 'bitbucket.org')).toBe(false);
    expect(hasDomain('not a URL', 'github.com')).toBe(false);
  });
});

describe('detectGitType', () => {
  it('should return GitProvider.GITHUB for GitHub URLs', () => {
    expect(detectGitType('https://github.com/user/repo')).toBe(
      GitProvider.GITHUB,
    );
    expect(detectGitType('git@github.com:user/repo.git')).toBe(
      GitProvider.GITHUB,
    );
  });

  it('should return GitProvider.BITBUCKET for Bitbucket URLs', () => {
    expect(detectGitType('https://bitbucket.org/user/repo')).toBe(
      GitProvider.BITBUCKET,
    );
    expect(detectGitType('git@bitbucket.org:user/repo.git')).toBe(
      GitProvider.BITBUCKET,
    );
  });

  it('should return GitProvider.GITLAB for GitLab URLs', () => {
    expect(detectGitType('https://gitlab.com/user/repo')).toBe(
      GitProvider.GITLAB,
    );
    expect(detectGitType('git@gitlab.com:user/repo.git')).toBe(
      GitProvider.GITLAB,
    );
  });

  it('should return GitProvider.UNSURE for other valid URLs', () => {
    expect(detectGitType('https://example.com/user/repo')).toBe(
      GitProvider.UNSURE,
    );
    expect(detectGitType('git@example.com:user/repo.git')).toBe(
      GitProvider.UNSURE,
    );
  });

  it('should return GitProvider.INVALID for invalid URLs', () => {
    expect(detectGitType('not a URL')).toBe(GitProvider.INVALID);
  });
});
