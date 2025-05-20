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
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { PassThrough } from 'stream';

import { createScaffoldedFromAction } from './createScaffoldedFromAction';

describe('catalog annotator', () => {
  const workspacePath =
    'plugins/scaffolder-backend-module-annotator/src/actions/annotator/mocks';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call action to annotate with template entityRef', async () => {
    const action = createScaffoldedFromAction();

    const logger = mockServices.logger.mock();
    jest.spyOn(logger, 'info');

    await action.handler({
      workspacePath,
      logger,
      logStream: new PassThrough(),
      templateInfo: {
        entityRef: 'test-entityRef',
      },
      output: jest.fn(),
      createTemporaryDirectory() {
        // Usage of createMockDirectory is recommended for testing of filesystem operations
        throw new Error('Not implemented');
      },
    } as any);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );

    const entity = yaml.parse(updatedCatalogInfoYaml);

    expect(logger.info).toHaveBeenCalledWith(
      'Annotating catalog-info.yaml with template entityRef',
    );
    expect(entity?.spec?.scaffoldedFrom).toBe('test-entityRef');

    // undo catalog-info.yaml file changes
    delete entity?.spec?.scaffoldedFrom;
    await fs.writeFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      yaml.stringify(entity),
      'utf8',
    );
  });

  it('should call action to annotate with template entityRef where the entityRef is read from the context', async () => {
    const action = createScaffoldedFromAction();

    const logger = mockServices.logger.mock();
    jest.spyOn(logger, 'info');

    await action.handler({
      workspacePath,
      logger,
      logStream: new PassThrough(),
      templateInfo: {
        entityRef: 'test-entityRef',
      },
      output: jest.fn(),
      createTemporaryDirectory() {
        // Usage of createMockDirectory is recommended for testing of filesystem operations
        throw new Error('Not implemented');
      },
    } as any);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );

    const entity = yaml.parse(updatedCatalogInfoYaml);

    expect(logger.info).toHaveBeenCalledWith(
      'Annotating catalog-info.yaml with template entityRef',
    );
    expect(entity?.spec?.scaffoldedFrom).toBe('test-entityRef');

    // undo catalog-info.yaml file changes
    delete entity?.spec?.scaffoldedFrom;
    await fs.writeFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      yaml.stringify(entity),
      'utf8',
    );
  });
});
