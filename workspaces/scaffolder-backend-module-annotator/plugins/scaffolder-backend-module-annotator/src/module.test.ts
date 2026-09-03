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
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import {
  scaffolderActionsExtensionPoint,
  TemplateAction,
} from '@backstage/plugin-scaffolder-node';

import { scaffolderCustomActionsScaffolderModule } from './module';

describe('scaffolderCustomActionsScaffolderModule', () => {
  const registerActions = async () => {
    const registered: TemplateAction[] = [];
    const extensionPoint = {
      addActions: (...actions: TemplateAction[]) => {
        registered.push(...actions);
      },
    };

    await startTestBackend({
      extensionPoints: [[scaffolderActionsExtensionPoint, extensionPoint]],
      features: [
        scaffolderCustomActionsScaffolderModule,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    return registered;
  };

  it('registers all four actions via the scaffolder extension point', async () => {
    const registered = await registerActions();
    const registeredIds = registered.map(action => action.id);

    expect(registeredIds).toHaveLength(4);
    expect(registeredIds).toEqual(
      expect.arrayContaining([
        'catalog:scaffolded-from',
        'catalog:timestamping',
        'catalog:annotate',
        'catalog:template:version',
      ]),
    );
  });

  it('exposes action-oriented descriptions and examples for Installed Actions', async () => {
    const registered = await registerActions();

    expect(registered).toHaveLength(4);

    const factoryWording = /Creates a new .*[Ss]caffolder action/;
    const issues = registered.map(action => ({
      id: action.id,
      description: action.description,
      awkwardDescription: factoryWording.test(action.description ?? ''),
      exampleCount: action.examples?.length ?? 0,
    }));

    expect({
      awkwardDescriptions: issues
        .filter(issue => issue.awkwardDescription)
        .map(issue => issue.id),
      missingExamples: issues
        .filter(issue => issue.exampleCount === 0)
        .map(issue => issue.id),
    }).toEqual({
      awkwardDescriptions: [],
      missingExamples: [],
    });
  });
});
