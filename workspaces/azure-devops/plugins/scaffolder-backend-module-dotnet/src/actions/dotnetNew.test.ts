/*
 * Copyright 2021 The Backstage Authors
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

jest.mock('@backstage/plugin-scaffolder-node', () => {
  return {
    ...jest.requireActual('@backstage/plugin-scaffolder-node'),
    initRepoAndPush: jest.fn().mockResolvedValue({
      commitHash: '220f19cc36b551763d157f1b5e4a4b446165dbd6',
    }),
    commitAndPushRepo: jest.fn().mockResolvedValue({
      commitHash: '220f19cc36b551763d157f1b5e4a4b446165dbd6',
    }),
    executeShellCommand: jest.fn().mockResolvedValue({
      commitHash: '220f19cc36b551763d157f1b5e4a4b446165dbd6',
    }),
  };
});

import { createdotnetNewAction } from './dotnetNew';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

describe('dotnet:new', () => {
  const action = createdotnetNewAction();

  const mockContext = createMockActionContext({
    input: {
      template: 'webapi',
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run dotnet new command', async () => {
    await action.handler({
      ...mockContext,
      input: {
        template: 'webapi',
        args: ['--name', 'myapp'],
      },
    });
    // Assert that executeShellCommand was called with the correct command and args
    const {
      executeShellCommand,
    } = require('@backstage/plugin-scaffolder-node');
    expect(executeShellCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'dotnet',
        args: ['new', 'webapi', '--name', 'myapp'],
      }),
    );
  });
  it('should run dotnet new with only template', async () => {
    await action.handler({
      ...mockContext,
      input: {
        template: 'console',
      },
    });
    const {
      executeShellCommand,
    } = require('@backstage/plugin-scaffolder-node');
    expect(executeShellCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'dotnet',
        args: ['new', 'console'],
      }),
    );
  });

  it('should run dotnet new with template and args', async () => {
    await action.handler({
      ...mockContext,
      input: {
        template: 'webapi',
        args: ['--name', 'myapp'],
      },
    });
    const {
      executeShellCommand,
    } = require('@backstage/plugin-scaffolder-node');
    expect(executeShellCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'dotnet',
        args: ['new', 'webapi', '--name', 'myapp'],
      }),
    );
  });

  it('should run dotnet new with template and targetPath', async () => {
    await action.handler({
      ...mockContext,
      input: {
        template: 'classlib',
        targetPath: 'src/libs',
      },
      workspacePath: '/tmp/workspace',
    });
    const {
      executeShellCommand,
    } = require('@backstage/plugin-scaffolder-node');
    expect(executeShellCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'dotnet',
        args: ['new', 'classlib'],
        options: expect.objectContaining({
          cwd: expect.stringContaining('src/libs'),
        }),
      }),
    );
  });

  it('should run dotnet new with template, args, and targetPath', async () => {
    await action.handler({
      ...mockContext,
      input: {
        template: 'webapi',
        args: ['--name', 'myweb'],
        targetPath: 'src/web',
      },
      workspacePath: '/tmp/workspace',
    });
    const {
      executeShellCommand,
    } = require('@backstage/plugin-scaffolder-node');
    expect(executeShellCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'dotnet',
        args: ['new', 'webapi', '--name', 'myweb'],
        options: expect.objectContaining({
          cwd: expect.stringContaining('src/web'),
        }),
      }),
    );
  });
});
