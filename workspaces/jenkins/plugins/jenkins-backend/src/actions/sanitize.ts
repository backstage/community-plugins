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

import type { BackstageBuild, BackstageProject } from '../types';

/**
 * Strips internal Jenkins fields (actions, _class, etc.) from a build,
 * keeping only the fields useful for MCP consumers.
 */
export function sanitizeBuild(build: BackstageBuild) {
  return {
    building: build.building,
    displayName: build.displayName,
    duration: build.duration,
    fullDisplayName: build.fullDisplayName,
    number: build.number,
    result: build.result,
    timestamp: build.timestamp,
    url: build.url,
    status: build.status,
    source: build.source,
  };
}

/**
 * Strips internal Jenkins fields from a project,
 * keeping only the fields useful for MCP consumers.
 */
export function sanitizeProject(project: BackstageProject) {
  return {
    name: (project as any).name,
    displayName: project.displayName,
    fullDisplayName: project.fullDisplayName,
    fullName: project.fullName,
    url: (project as any).url,
    inQueue: project.inQueue,
    status: project.status,
    lastBuild: project.lastBuild ? sanitizeBuild(project.lastBuild) : null,
  };
}
