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
import { RunStatus, WhenStatus } from '@patternfly/react-topology';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import {
  extractDepsFromContextVariables,
  getGraphDataModel,
  getTaskWhenStatus,
} from './pipeline-topology-utils';
import { getPipelineRun } from './pipelineRun-utils';

describe('getPipelineRun', () => {
  it('should return the required pipeline run resource', () => {
    expect(
      getPipelineRun(
        mockKubernetesPlrResponse.pipelineruns,
        'pipeline-test-wbvtlk',
      ),
    ).toEqual(mockKubernetesPlrResponse.pipelineruns[1]);
  });

  it('should return null if pipeline run doesnot exist', () => {
    expect(
      getPipelineRun(mockKubernetesPlrResponse.pipelineruns, 'bnb'),
    ).toEqual(null);
  });
});

describe('extractDepsFromContextVariables', () => {
  it('should return emtpy array for invalid values', () => {
    expect(extractDepsFromContextVariables('')).toEqual([]);
    expect(extractDepsFromContextVariables(null)).toEqual([]);
    expect(extractDepsFromContextVariables(undefined)).toEqual([]);
  });

  it('should return empty array if the context variable string does not contain results', () => {
    expect(extractDepsFromContextVariables('$(context.pipeline.name)')).toEqual(
      [],
    );
    expect(
      extractDepsFromContextVariables('$(context.pipelinerun.name)'),
    ).toEqual([]);
  });

  it('should return a task name if the context variable string contains results', () => {
    const contextVariable = '$(tasks.task1.results.sum)';
    expect(extractDepsFromContextVariables(contextVariable)).toEqual(['task1']);
  });

  it('should return a list of task names if the context variable string contains multiple results', () => {
    const contextVariable =
      '$(tasks.task1.results.sum)  $(tasks.task2.results.sum)';

    expect(extractDepsFromContextVariables(contextVariable)).toEqual([
      'task1',
      'task2',
    ]);
  });
});

describe('getTaskWhenStatus:', () => {
  const [task1] =
    mockKubernetesPlrResponse.pipelineruns[0].status.pipelineSpec.tasks;

  const taskWithStatus = (
    reason: RunStatus = RunStatus.Succeeded,
    when?: boolean,
  ) => {
    return {
      ...task1,
      ...(when && {
        when: [
          {
            input: 'params.test',
            operator: 'IN',
            values: ['pass'],
          },
        ],
      }),
      status: {
        reason,
        conditions: [],
      },
    };
  };

  it('should return undefined if the task does not have when expression', () => {
    expect(getTaskWhenStatus(taskWithStatus())).toBeUndefined();
  });

  it('should return a matching when status', () => {
    const succeededTask = {
      ...taskWithStatus(RunStatus.Succeeded, true),
    };
    const skippedTask = {
      ...taskWithStatus(RunStatus.Skipped, true),
    };
    expect(getTaskWhenStatus(succeededTask)).toBe(WhenStatus.Met);
    expect(getTaskWhenStatus(skippedTask)).toBe(WhenStatus.Unmet);
  });
});

describe('getGraphDataModel', () => {
  it('should return null for invalid values', () => {
    expect(getGraphDataModel(undefined, [])).toBeNull();
  });

  it('should return graph, nodes and edges for valid pipelineRun', () => {
    const model = getGraphDataModel(
      mockKubernetesPlrResponse.pipelineruns[0],
      mockKubernetesPlrResponse.taskruns,
    );
    expect(model?.graph).toBeDefined();
    expect(model?.nodes).toHaveLength(3);
    expect(model?.edges).toHaveLength(2);
  });

  it('should include the finally group and nodes for the pipeline with finally task', () => {
    const model = getGraphDataModel(
      mockKubernetesPlrResponse.pipelineruns[1],
      mockKubernetesPlrResponse.taskruns,
    );
    const finallyGroup = model?.nodes.filter(n => n.type === 'finally-group');
    const finallyNodes = model?.nodes.filter(n => n.type === 'finally-node');

    expect(finallyGroup).toHaveLength(1);
    expect(finallyNodes).toHaveLength(1);
  });
});
