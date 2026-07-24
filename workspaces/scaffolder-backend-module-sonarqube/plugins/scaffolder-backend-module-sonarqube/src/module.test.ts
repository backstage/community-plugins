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
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

import { scaffolderModuleSonarqubeActions } from './module';

describe('scaffolderModuleSonarqubeActions', () => {
  it('registers the sonarqube:create-project action via the scaffolder extension point', async () => {
    const registeredIds: string[] = [];
    const extensionPoint = {
      addActions: (...actions: { id: string }[]) => {
        registeredIds.push(...actions.map(action => action.id));
      },
    };

    await startTestBackend({
      extensionPoints: [[scaffolderActionsExtensionPoint, extensionPoint]],
      features: [
        scaffolderModuleSonarqubeActions,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    expect(registeredIds).toEqual(['sonarqube:create-project']);
  });
});
