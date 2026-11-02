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

import gitReleaseManagerPlugin from './index';

jest.mock('./GitReleaseManager', () => {
  throw new Error('The page implementation was loaded eagerly');
});

describe('git release manager frontend plugin', () => {
  it('exposes the override API through its default export', () => {
    const overriddenPlugin = gitReleaseManagerPlugin.withOverrides({
      title: 'Custom Git Release Manager',
    });

    expect(overriddenPlugin.title).toBe('Custom Git Release Manager');
    expect(
      overriddenPlugin.getExtension('page:git-release-manager'),
    ).toBeDefined();
    expect(
      overriddenPlugin.getExtension('api:git-release-manager/service'),
    ).toBeDefined();
  });

  it('registers the frontend feature without loading the page eagerly', () => {
    expect(gitReleaseManagerPlugin.pluginId).toBe('git-release-manager');
    expect(gitReleaseManagerPlugin.routes.root).toBeDefined();

    // The extension list is the plugin's internal shape; nothing public
    // reports which extensions a plugin carries.
    const { extensions } = gitReleaseManagerPlugin as unknown as {
      extensions: { id: string }[];
    };
    expect(extensions.map(extension => extension.id)).toEqual([
      'api:git-release-manager/service',
      'page:git-release-manager',
    ]);
  });
});
