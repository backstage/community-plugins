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
import { FileEntry } from '../types';
import { Converter } from './Converter';
import { LoggerService } from '@backstage/backend-plugin-api';

type FunctionIndex = {
  byName: Map<string, { slots: number[]; next: number }>;
  byIndex: Map<string, number>;
};

const newFunctionIndex = (): FunctionIndex => ({
  byName: new Map(),
  byIndex: new Map(),
});

export class Lcov implements Converter {
  constructor(readonly logger: LoggerService) {
    this.logger = logger;
  }

  /**
   * convert lcov into shared json coverage format
   *
   * @param raw - raw lcov report
   * @param scmFiles - list of files that are committed to SCM
   */
  convert(raw: string, scmFiles: string[]): FileEntry[] {
    const lines = raw.split(/\r?\n/);
    const jscov: Array<FileEntry> = [];
    let currentFile: FileEntry | null = null;
    let functions = newFunctionIndex();

    lines.forEach(line => {
      const separator = line.indexOf(':');
      const section = separator === -1 ? line : line.slice(0, separator);
      const value = separator === -1 ? '' : line.slice(separator + 1);

      switch (section) {
        // If the line starts with SF, it's a new file
        case 'SF':
          currentFile = this.processNewFile(value, scmFiles);
          functions = newFunctionIndex();
          break;
        // If the line starts with DA, it's a line hit
        case 'DA':
          this.processLineHit(currentFile, value);
          break;
        // If the line starts with BRDA, it's a branch line
        case 'BRDA':
          this.processBranchHit(currentFile, value);
          break;
        // If the line starts with FN, it's a function declaration
        case 'FN':
          this.processFunctionFound(currentFile, functions, value);
          break;
        // If the line starts with FNDA, it's a function hit
        case 'FNDA':
          this.processFunctionHit(currentFile, functions, value);
          break;
        // If the line starts with FNL, it's a function declaration (lcov 2.2+)
        case 'FNL':
          this.processFunctionLocation(currentFile, functions, value);
          break;
        // If the line starts with FNA, it's a function alias with hits (lcov 2.2+)
        case 'FNA':
          this.processFunctionAlias(currentFile, functions, value);
          break;
        // If the line starts with end_of_record, it's the end of current file
        case 'end_of_record':
          if (currentFile) {
            jscov.push(currentFile);
            currentFile = null;
          }
          break;
        default:
          break;
      }
    });

    return jscov;
  }

  /**
   * Parses a new file entry
   *
   * @param file - file name from coverage report
   * @param scmFiles - list of files that are committed to SCM
   */
  private processNewFile(file: string, scmFiles: string[]): FileEntry | null {
    const filename = scmFiles.map(f => f.trimEnd()).find(f => file.endsWith(f));

    this.logger.debug(`matched ${file} to ${filename}`);

    if (scmFiles.length === 0 || filename) {
      return {
        filename: filename || file,
        lineHits: {},
        branchHits: {},
        functionHits: [],
      };
    }

    return null;
  }

  /**
   * Parses line coverage information
   *
   * @param currentFile - current file entry
   * @param value - line coverage information
   */
  private processLineHit(currentFile: FileEntry | null, value: string): void {
    if (!currentFile) return;

    const [lineNumber, hits] = value.split(',');
    currentFile.lineHits[Number(lineNumber)] = Number(hits);
  }

  /**
   * Parses branch coverage information
   *
   * @param currentFile - current file entry
   * @param value - branch coverage information
   */
  private processBranchHit(currentFile: FileEntry | null, value: string): void {
    if (!currentFile) return;

    const [lineNumber, , , hits] = value.split(',');
    const lineNumberNum = Number(lineNumber);
    const isHit = Number(hits) > 0;
    const branch = currentFile.branchHits[lineNumberNum] || {
      covered: 0,
      available: 0,
      missed: 0,
    };

    branch.available++;
    branch.covered += isHit ? 1 : 0;
    branch.missed += isHit ? 0 : 1;

    currentFile.branchHits[lineNumberNum] = branch;
  }

  /**
   * Parses a function declaration (FN)
   *
   * @param currentFile - current file entry
   * @param functions - function index of the current file
   * @param value - function declaration
   */
  private processFunctionFound(
    currentFile: FileEntry | null,
    functions: FunctionIndex,
    value: string,
  ): void {
    if (!currentFile) return;

    const name = value.replace(/^\d+,(?:\d+,)?/, '');
    if (!name) return;

    const hits = (currentFile.functionHits ??= []);
    const entry = functions.byName.get(name) ?? { slots: [], next: 0 };
    entry.slots.push(hits.length);
    functions.byName.set(name, entry);
    hits.push(0);
  }

  /**
   * Parses function hit information (FNDA)
   *
   * @param currentFile - current file entry
   * @param functions - function index of the current file
   * @param value - function hit information
   */
  private processFunctionHit(
    currentFile: FileEntry | null,
    functions: FunctionIndex,
    value: string,
  ): void {
    if (!currentFile?.functionHits) return;

    const separator = value.indexOf(',');
    if (separator === -1) return;

    const entry = functions.byName.get(value.slice(separator + 1));
    if (!entry || entry.next >= entry.slots.length) return;

    const hits = Number(value.slice(0, separator));
    currentFile.functionHits[entry.slots[entry.next]] = Number.isFinite(hits)
      ? hits
      : 0;
    entry.next++;
  }

  /**
   * Parses a function declaration (FNL, lcov 2.2+)
   *
   * @param currentFile - current file entry
   * @param functions - function index of the current file
   * @param value - function location information
   */
  private processFunctionLocation(
    currentFile: FileEntry | null,
    functions: FunctionIndex,
    value: string,
  ): void {
    if (!currentFile) return;

    const separator = value.indexOf(',');
    if (separator <= 0) return;

    const index = value.slice(0, separator);
    if (functions.byIndex.has(index)) return;

    const hits = (currentFile.functionHits ??= []);
    functions.byIndex.set(index, hits.length);
    hits.push(0);
  }

  /**
   * Parses a function alias with its hits (FNA, lcov 2.2+)
   *
   * @param currentFile - current file entry
   * @param functions - function index of the current file
   * @param value - function alias information
   */
  private processFunctionAlias(
    currentFile: FileEntry | null,
    functions: FunctionIndex,
    value: string,
  ): void {
    if (!currentFile) return;

    const [index, hits] = value.split(',');
    if (!index || !hits) return;

    if (!functions.byIndex.has(index)) {
      this.processFunctionLocation(currentFile, functions, `${index},0`);
    }

    const slot = functions.byIndex.get(index);
    if (slot === undefined || !currentFile.functionHits) return;

    currentFile.functionHits[slot] = Math.max(
      currentFile.functionHits[slot],
      Number(hits) || 0,
    );
  }
}
