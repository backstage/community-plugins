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
import { PipelineRunLogStep } from '../types/pipelinerun';

/*
 * Clean escaped characters from logs
 * @param logs: string
 * @returns string
 * */
export const cleanLogs = (logs: string): string => {
  return !logs
    ? ''
    : logs.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '');
};

/*
 * Extract JSON between two anchors (EYE_CATCHERS)
 * @param logs: string
 * @returns Record<string, any> | undefined
 */
export const extractJSON = (
  logs: string,
  startAnchor: string,
  endAnchor: string,
): Record<string, any> | undefined => {
  const cleanedLogs = cleanLogs(logs);
  const regex = new RegExp(`${startAnchor}(.*?)${endAnchor}`, 's');
  const match = cleanedLogs.match(regex);

  if (!match) {
    return undefined;
  }

  // Remove log timestamp till timezone
  const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/g;
  const cleanMatch: string = match[1].split('\n').reduce((acc, line) => {
    const cleanedLine = line.replace(timestampPattern, '').trim();
    if (!cleanedLine) return acc;
    return `${acc} ${cleanedLine}`;
  }, '');

  try {
    return JSON.parse(cleanMatch);
  } catch (e) {
    return undefined;
  }
};

/*
 * Extract Pipelinesteps from logs
 * @param stepLogs: string
 * @returns PipelineRunLogStep[]
 */
export const extractPipelineSteps = (
  stepLogs: string,
): PipelineRunLogStep[] => {
  // TODO: Async logs may be in incorrect order
  const cleanedLogs = cleanLogs(stepLogs);
  const stepLines = cleanedLogs.split('Step: ');
  const knownSteps = new Set<string>();
  // Skip the first line as it is not a step
  return stepLines
    .slice(1)
    .reduce((acc: PipelineRunLogStep[], stepLine: string) => {
      const [name, ...logs] = stepLine.split('\n');
      // Ignore dupes
      if (!knownSteps.has(name)) {
        acc.push({ name, logs: logs.join('\n') });
        knownSteps.add(name);
      }
      return acc;
    }, []);
};
