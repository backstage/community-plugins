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

import { getCurrentTimestamp } from '../../utils/getCurrentTimestamp';
import { createAnnotatorAction } from './annotator';

describe('catalog annotator', () => {
  const workspacePath =
    'plugins/scaffolder-backend-module-annotator/src/actions/annotator/mocks';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call action to annotate with timestamp', async () => {
    const action = createAnnotatorAction(
      'catalog:timestamping',
      'Creates a new `catalog:timestamping` Scaffolder action to annotate scaffolded entities with creation timestamp.',
      'some logger info msg',
      () => {
        return {
          annotations: { 'backstage.io/createdAt': getCurrentTimestamp() },
        };
      },
    );

    const logger = mockServices.logger.mock();
    jest.spyOn(logger, 'info');

    await action.handler({
      workspacePath,
      logger,
      logStream: new PassThrough(),
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

    expect(logger.info).toHaveBeenCalledWith('some logger info msg');
    expect(
      entity?.metadata?.annotations?.['backstage.io/createdAt'],
    ).toBeTruthy();

    // undo catalog-info.yaml file changes
    delete entity?.metadata?.annotations?.['backstage.io/createdAt'];
    await fs.writeFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      yaml.stringify(entity),
      'utf8',
    );
  });

  it('should call action to annotate catalog-info.yaml', async () => {
    const catalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );
    const action = createAnnotatorAction(
      'catalog:test-annotate',
      'Creates a new `catalog:test-annotate` Scaffolder action to annotate catalog-info.yaml with labels and annotations.',
      '',
      () => {
        return {};
      },
    );

    const logger = mockServices.logger.mock();
    jest.spyOn(logger, 'info');

    const mockContext = {
      workspacePath,
      logger,
      logStream: new PassThrough(),
      input: {
        labels: {
          label1: 'value1',
          label2: 'value2',
          label3: 'value3',
        },
        annotations: {
          annotation1: 'value1',
          annotation2: 'value2',
          annotation3: 'value3',
        },
      },
      output: jest.fn(),
      createTemporaryDirectory() {
        // Usage of createMockDirectory is recommended for testing of filesystem operations
        throw new Error('Not implemented');
      },
    };

    await action.handler(mockContext as any);

    let entity: { [key: string]: any } = yaml.parse(catalogInfoYaml);
    entity = {
      ...entity,
      metadata: {
        ...entity.metadata,
        labels: {
          ...entity.metadata.labels,
          ...mockContext.input.labels,
        },
        annotations: {
          ...entity.metadata.annotations,
          ...mockContext.input.annotations,
        },
      },
    };

    expect(logger.info).toHaveBeenCalledWith('Annotating your object');
    expect(mockContext.output).toHaveBeenCalledWith(
      'annotatedObject',
      yaml.stringify(entity),
    );
  });

  it('should call action to annotate any obj', async () => {
    const action = createAnnotatorAction(
      'catalog:test-annotate-obj',
      'Creates a new `catalog:test-annotate-obj` Scaffolder action to annotate any object yaml with labels and annotations.',
      'some logger info message',
      () => {
        return {};
      },
    );

    const logger = mockServices.logger.mock();
    jest.spyOn(logger, 'info');

    const obj: { [key: string]: any } = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'n',
        namespace: 'ns',
        annotations: {
          ['backstage.io/managed-by-origin-location']:
            'url:https://example.com',
        },
      },
      spec: {},
    };

    const mockContext = {
      workspacePath,
      logger,
      logStream: new PassThrough(),
      input: {
        labels: {
          label1: 'value1',
          label2: 'value2',
          label3: 'value3',
        },
        annotations: {
          annotation1: 'value1',
          annotation2: 'value2',
          annotation3: 'value3',
        },
        objectYaml: obj,
      },
      output: jest.fn(),
      createTemporaryDirectory() {
        // Usage of createMockDirectory is recommended for testing of filesystem operations
        throw new Error('Not implemented');
      },
    };

    await action.handler(mockContext as any);

    const entity = {
      ...obj,
      metadata: {
        ...obj.metadata,
        labels: {
          ...(obj.metadata.labels || {}),
          ...mockContext.input.labels,
        },
        annotations: {
          ...(obj.metadata.annotations || {}),
          ...mockContext.input.annotations,
        },
      },
    };

    expect(logger.info).toHaveBeenCalledWith('some logger info message');
    expect(mockContext.output).toHaveBeenCalledWith(
      'annotatedObject',
      yaml.stringify(entity),
    );
  });

  it('should call action to annotate with template entityRef', async () => {
    const action = createAnnotatorAction(
      'catalog:entityRef',
      'Some description',
      'some logger info msg',
      () => {
        return { spec: { scaffoldedFrom: 'testt-ref' } };
      },
    );

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

    expect(logger.info).toHaveBeenCalledWith('some logger info msg');
    expect(entity?.spec?.scaffoldedFrom).toBe('testt-ref');

    // undo catalog-info.yaml file changes
    delete entity?.spec?.scaffoldedFrom;
    await fs.writeFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      yaml.stringify(entity),
      'utf8',
    );
  });

  it('should call action to annotate with template entityRef where the entityRef is read from the context', async () => {
    const action = createAnnotatorAction(
      'catalog:entityRef',
      'Some description',
      'some logger info msg',
      () => {
        return {
          spec: {
            scaffoldedFrom: { readFromContext: 'templateInfo.entityRef' },
          },
        };
      },
    );

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

    expect(logger.info).toHaveBeenCalledWith('some logger info msg');
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
