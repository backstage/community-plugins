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

// Lightweight replacement for aws-sdk-client-mock and aws-sdk-client-mock-jest.
// Originally sourced from https://github.com/m-radzikowski/aws-sdk-client-mock

type CommandConstructor = new (...args: any[]) => any;

interface RecordedCall {
  commandClass: CommandConstructor;
  input: any;
}

export class AwsClientMock {
  private handlers = new Map<CommandConstructor, Function>();
  private calls: RecordedCall[] = [];

  constructor(ClientClass: any) {
    ClientClass.prototype.send = async (command: any) => {
      this.calls.push({
        commandClass: command.constructor,
        input: command.input,
      });
      const handler = this.handlers.get(command.constructor);
      if (handler) {
        return handler(command.input);
      }
      throw new Error(`No mock handler for ${command.constructor.name}`);
    };
  }

  on(CommandClass: CommandConstructor) {
    return {
      callsFake: (fn: (input: any) => any) => {
        this.handlers.set(CommandClass, fn);
      },
    };
  }

  reset() {
    this.handlers.clear();
    this.calls = [];
  }

  commandCalls(CommandClass: CommandConstructor): RecordedCall[] {
    return this.calls.filter(c => c.commandClass === CommandClass);
  }
}

export function mockClient(ClientClass: any): AwsClientMock {
  return new AwsClientMock(ClientClass);
}

if (typeof expect !== 'undefined')
  expect.extend({
    toHaveReceivedCommandWith(
      received: AwsClientMock,
      CommandClass: CommandConstructor,
      expectedInput: Record<string, any>,
    ) {
      const calls = received.commandCalls(CommandClass);
      const pass = calls.some(call =>
        Object.entries(expectedInput).every(
          ([key, value]) => call.input?.[key] === value,
        ),
      );

      return {
        pass,
        message: () =>
          pass
            ? `Expected mock not to have received ${
                CommandClass.name
              } with ${JSON.stringify(expectedInput)}`
            : `Expected mock to have received ${
                CommandClass.name
              } with ${JSON.stringify(
                expectedInput,
              )}, but it was not called with those arguments`,
      };
    },
  });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveReceivedCommandWith(
        command: CommandConstructor,
        input: Record<string, any>,
      ): R;
    }
  }
}
