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
import { FileAdapter, Helper, Model, mustGetDefaultFileSystem } from 'casbin';

export class LowercaseFileAdapter extends FileAdapter {
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
        policyArray[1] = policyArray[1].toLowerCase();
      }
      return policyArray.join(',');
    }
    return line;
  }

  private async loadLowercasePolicyFile(
    model: Model,
    handler: (line: string, model: Model) => void,
  ): Promise<void> {
    const bodyBuf = await (
      this.fs ? this.fs : mustGetDefaultFileSystem()
    ).readFileSync(this.filePath);
    const lines = bodyBuf.toString().split('\n');

    lines.forEach((n: string, index: number) => {
      if (!n) {
        return;
      }
      const lowercasedLine = this.transformLineToLowercaseGroupsUsers(n);
      handler(lowercasedLine, model);
    });
  }
}