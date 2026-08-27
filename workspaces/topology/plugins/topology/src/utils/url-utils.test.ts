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
import { unsafeScriptUrl } from '../test-utils/unsafeScriptUrl';
import { isValidGitUrl, isValidHttpUrl, MAX_URL_LENGTH } from './url-utils';

describe('isValidHttpUrl', () => {
  it('should accept http and https URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/path')).toBe(true);
  });

  it('should reject non-http schemes and empty values', () => {
    expect(isValidHttpUrl(unsafeScriptUrl())).toBe(false);
    expect(isValidHttpUrl('data:text/html,hi')).toBe(false);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl(null)).toBe(false);
    expect(isValidHttpUrl(undefined)).toBe(false);
  });

  it('should reject URLs longer than MAX_URL_LENGTH', () => {
    expect(
      isValidHttpUrl(`https://example.com/${'a'.repeat(MAX_URL_LENGTH)}`),
    ).toBe(false);
  });
});

describe('isValidGitUrl', () => {
  it('should accept http, https, ssh, and git schemes', () => {
    expect(isValidGitUrl('https://github.com/user/repo')).toBe(true);
    expect(isValidGitUrl('http://github.com/user/repo')).toBe(true);
    expect(isValidGitUrl('ssh://git@github.com/user/repo.git')).toBe(true);
    expect(isValidGitUrl('git://github.com/user/repo.git')).toBe(true);
  });

  it('should accept SCP-like git URLs', () => {
    expect(isValidGitUrl('git@github.com:user/repo.git')).toBe(true);
    expect(isValidGitUrl('user@gitlab.com:group/repo.git')).toBe(true);
  });

  it('should reject unsafe or invalid values', () => {
    expect(isValidGitUrl(unsafeScriptUrl())).toBe(false);
    expect(isValidGitUrl('file:///etc/passwd')).toBe(false);
    expect(isValidGitUrl('not a URL')).toBe(false);
    expect(isValidGitUrl('')).toBe(false);
    expect(isValidGitUrl(null)).toBe(false);
  });

  it('should reject URLs longer than MAX_URL_LENGTH', () => {
    expect(
      isValidGitUrl(`https://github.com/user/${'a'.repeat(MAX_URL_LENGTH)}`),
    ).toBe(false);
  });
});
