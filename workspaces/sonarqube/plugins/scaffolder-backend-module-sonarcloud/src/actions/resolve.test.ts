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

import { requireToken, requireOrganization } from './resolve';
import type { SonarCloudDefaults } from '../lib';

describe('requireToken', () => {
  it('should return token when present', () => {
    const defaults: SonarCloudDefaults = { token: 'my-token' };
    expect(requireToken(defaults)).toBe('my-token');
  });

  it('should throw when token is missing', () => {
    const defaults: SonarCloudDefaults = {};
    expect(() => requireToken(defaults)).toThrow(
      'Missing SonarCloud token: set sonarqube.apiKey in app-config',
    );
  });

  it('should throw when defaults is empty object', () => {
    expect(() => requireToken({})).toThrow(
      'Missing SonarCloud token: set sonarqube.apiKey in app-config',
    );
  });
});

describe('requireOrganization', () => {
  it('should return organization when present', () => {
    const defaults: SonarCloudDefaults = { organization: 'my-org' };
    expect(requireOrganization(defaults)).toBe('my-org');
  });

  it('should throw when organization is missing', () => {
    const defaults: SonarCloudDefaults = {};
    expect(() => requireOrganization(defaults)).toThrow(
      'Missing SonarCloud organization: set sonarqube.organizationName in app-config',
    );
  });

  it('should throw when defaults is empty object', () => {
    expect(() => requireOrganization({})).toThrow(
      'Missing SonarCloud organization: set sonarqube.organizationName in app-config',
    );
  });
});
