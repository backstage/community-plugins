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
import type { LoggerService } from '@backstage/backend-plugin-api';

import { FileAdapter, Helper, Model, mustGetDefaultFileSystem } from 'casbin';

export class LowercaseFileAdapter extends FileAdapter {
  constructor(
    filePath: string,
    private readonly logger?: LoggerService,
  ) {
    super(filePath);
  }

  public async loadPolicy(model: Model): Promise<void> {
    if (!this.filePath) {
      return;
    }
    await this.loadLowercasePolicyFile(model, Helper.loadPolicyLine);
  }

  private transformLineToLowercaseGroupsUsers(line: string): string {
    if (line.trim().startsWith('g')) {
      const policyArray = line.split(',');
      if (policyArray.length >= 1 && policyArray[0].trim().startsWith('g')) {
        policyArray[1] = policyArray[1].toLocaleLowerCase('en-US');
      }
      return policyArray.join(',');
    }
    return line;
  }

  private async loadLowercasePolicyFile(
    model: Model,
    handler: (line: string, model: Model) => void,
  ): Promise<void> {
    // Reference: https://github.com/casbin/node-casbin/blob/master/src/persist/fileAdapter.ts#L34-#L43
    const bodyBuf = await (
      this.fs ? this.fs : mustGetDefaultFileSystem()
    ).readFileSync(this.filePath);
    const lines = bodyBuf.toString().split('\n');

    lines.forEach((line: string, index: number) => {
      const trimmed = line.replace(/\r$/, '').trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }
      const lineNumber = index + 1;
      try {
        const lowercasedLine =
          this.transformLineToLowercaseGroupsUsers(trimmed);
        handler(lowercasedLine, model);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger?.warn(
          `Skipping invalid policy line ${lineNumber} in ${this.filePath}: ${message}; line=${trimmed.slice(
            0,
            120,
          )}`,
        );
      }
    });
  }
}
