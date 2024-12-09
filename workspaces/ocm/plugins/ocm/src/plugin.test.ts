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
import { OcmApiClient } from './api';
import { ocmPlugin } from './plugin';

describe('ocm', () => {
  it('should export plugin', () => {
    expect(ocmPlugin).toBeDefined();
  });

  it('should have the OCM api', () => {
    const apiFactories = Array.from(ocmPlugin.getApis());
    expect(apiFactories.length).toBe(1);
    expect(apiFactories[0].factory({})).toBeInstanceOf(OcmApiClient);
  });
});
