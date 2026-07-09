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
import { createMockDirectory } from '@backstage/backend-test-utils';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { getCurrentTimestamp } from '../../utils/getCurrentTimestamp';
import { createAnnotatorAction } from './annotator';

type TestCatalogEntity = {
  apiVersion: string;
  kind: string;
  metadata: {
    name?: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec?: Record<string, string>;
};

const catalogEntityContent = fs.readFileSync(
  resolveSafeChildPath(__dirname, './mocks/catalog-info.yaml'),
  'utf8',
);

describe('catalog annotator', () => {
  const mockDir = createMockDirectory();
  const workspacePath = mockDir.resolve('workspace');

  afterEach(() => {
    jest.resetAllMocks();
    mockDir.clear();
  });

  it('should call action to annotate with timestamp', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogEntityContent,
      },
    });

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

    const ctx = createMockActionContext({
      workspacePath,
    });

    ctx.logger.info = jest.fn();

    await action.handler(ctx);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );

    const entity = yaml.parse(updatedCatalogInfoYaml);

    expect(ctx.logger.info).toHaveBeenCalledWith('some logger info msg');
    expect(
      entity?.metadata?.annotations?.['backstage.io/createdAt'],
    ).toBeTruthy();
  });

  it('should call action to annotate catalog-info.yaml', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogEntityContent,
      },
    });

    const action = createAnnotatorAction(
      'catalog:test-annotate',
      'Creates a new `catalog:test-annotate` Scaffolder action to annotate catalog-info.yaml with labels and annotations.',
      '',
      () => {
        return {};
      },
    );

    const inputLabels = {
      label1: 'value1',
      label2: 'value2',
      label3: 'value3',
    };
    const inputAnnotations = {
      annotation1: 'value1',
      annotation2: 'value2',
      annotation3: 'value3',
    };

    const ctx = createMockActionContext({
      workspacePath,
      input: {
        labels: inputLabels,
        annotations: inputAnnotations,
      },
    });

    ctx.logger.info = jest.fn();

    await action.handler(ctx);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );
    const writtenEntity = yaml.parse(
      updatedCatalogInfoYaml,
    ) as TestCatalogEntity;

    const parsedEntity = yaml.parse(catalogEntityContent) as TestCatalogEntity;
    const expectedEntity: TestCatalogEntity = {
      ...parsedEntity,
      metadata: {
        ...parsedEntity.metadata,
        labels: {
          ...parsedEntity.metadata.labels,
          ...inputLabels,
        },
        annotations: {
          ...parsedEntity.metadata.annotations,
          ...inputAnnotations,
        },
      },
    };

    expect(ctx.logger.info).toHaveBeenCalledWith('Annotating your object');
    expect(writtenEntity.metadata.labels).toEqual(
      expectedEntity.metadata.labels,
    );
    expect(writtenEntity.metadata.annotations).toEqual(
      expectedEntity.metadata.annotations,
    );
    expect(ctx.output).toHaveBeenCalledWith(
      'annotatedObject',
      yaml.stringify(expectedEntity),
    );
  });

  it('should call action to annotate any obj', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogEntityContent,
      },
    });

    const action = createAnnotatorAction(
      'catalog:test-annotate-obj',
      'Creates a new `catalog:test-annotate-obj` Scaffolder action to annotate any object yaml with labels and annotations.',
      'some logger info message',
      () => {
        return {};
      },
    );

    const inputLabels = {
      label1: 'value1',
      label2: 'value2',
      label3: 'value3',
    };
    const inputAnnotations = {
      annotation1: 'value1',
      annotation2: 'value2',
      annotation3: 'value3',
    };

    const obj: TestCatalogEntity = {
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

    const ctx = createMockActionContext({
      workspacePath,
      input: {
        labels: inputLabels,
        annotations: inputAnnotations,
        objectYaml: obj,
      },
    });

    ctx.logger.info = jest.fn();

    await action.handler(ctx);

    const expectedEntity: TestCatalogEntity = {
      ...obj,
      metadata: {
        ...obj.metadata,
        labels: {
          ...(obj.metadata.labels ?? {}),
          ...inputLabels,
        },
        annotations: {
          ...obj.metadata.annotations,
          ...inputAnnotations,
        },
      },
    };

    expect(ctx.logger.info).toHaveBeenCalledWith('some logger info message');
    expect(ctx.output).toHaveBeenCalledWith(
      'annotatedObject',
      yaml.stringify(expectedEntity),
    );
  });

  it('should call action to annotate with template entityRef', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogEntityContent,
      },
    });

    const action = createAnnotatorAction(
      'catalog:entityRef',
      'Some description',
      'some logger info msg',
      () => {
        return { spec: { scaffoldedFrom: 'testt-ref' } };
      },
    );

    const ctx = createMockActionContext({
      workspacePath,
      templateInfo: {
        entityRef: 'test-entityRef',
      },
    });

    ctx.logger.info = jest.fn();

    await action.handler(ctx);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );

    const entity = yaml.parse(updatedCatalogInfoYaml);

    expect(ctx.logger.info).toHaveBeenCalledWith('some logger info msg');
    expect(entity?.spec?.scaffoldedFrom).toBe('testt-ref');
  });

  it('should call action to annotate with template entityRef where the entityRef is read from the context', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogEntityContent,
      },
    });

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

    const ctx = createMockActionContext({
      workspacePath,
      templateInfo: {
        entityRef: 'test-entityRef',
      },
    });

    ctx.logger.info = jest.fn();

    await action.handler(ctx);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(workspacePath, './catalog-info.yaml'),
      'utf8',
    );

    const entity = yaml.parse(updatedCatalogInfoYaml);

    expect(ctx.logger.info).toHaveBeenCalledWith('some logger info msg');
    expect(entity?.spec?.scaffoldedFrom).toBe('test-entityRef');
  });
});
