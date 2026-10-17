/*
 * Copyright 2020 The Backstage Authors
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

import { camelCase } from 'lodash';
import { buildQuery } from '../util';
import {
  RollbarItemCount,
  RollbarItemsResponse,
  RollbarProject,
  RollbarTopActiveItem,
} from './types';
import fetch from 'node-fetch';
import { CacheService, LoggerService } from '@backstage/backend-plugin-api';

const CACHE_KEY = 'projectmap';
const CACHE_TTL = 300;

const baseUrl = 'https://api.rollbar.com/api/1';

const buildUrl = (url: string) => `${baseUrl}${url}`;

function camelize<T extends unknown>(val: T): T {
  if (Array.isArray(val)) {
    return val.map(camelize) as T;
  }
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [camelCase(k), camelize(v)]),
    ) as T;
  }
  return val;
}

/** @public */
export class RollbarApi {
  constructor(
    private readonly accessToken: string,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {}

  async getAllProjects() {
    return this.get<RollbarProject[]>('/projects').then(projects =>
      projects.filter(p => p.name),
    );
  }

  async getProject(projectName: string) {
    return this.getForProject<RollbarProject>(
      `/project/:projectId`,
      projectName,
      false,
    );
  }

  async getProjectItems(projectName: string) {
    return this.getForProject<RollbarItemsResponse>(
      `/items`,
      projectName,
      true,
    );
  }

  async getTopActiveItems(
    projectName: string,
    options: { hours: number; environment: string } = {
      hours: 24,
      environment: 'production',
    },
  ) {
    return this.getForProject<RollbarTopActiveItem[]>(
      `/reports/top_active_items?${buildQuery(options)}`,
      projectName,
    );
  }

  async getOccuranceCounts(
    projectName: string,
    options: { environment: string; item_id?: number } = {
      environment: 'production',
    },
  ) {
    return this.getForProject<RollbarItemCount[]>(
      `/reports/occurrence_counts?${buildQuery(options as any)}`,
      projectName,
    );
  }

  async getActivatedCounts(
    projectName: string,
    options: { environment: string; item_id?: number } = {
      environment: 'production',
    },
  ) {
    return this.getForProject<RollbarItemCount[]>(
      `/reports/activated_counts?${buildQuery(options as any)}`,
      projectName,
    );
  }

  private async get<T extends {}>(
    url: string,
    accessToken?: string,
  ): Promise<T> {
    const fullUrl = buildUrl(url);

    if (this.logger) {
      this.logger.info(`Calling Rollbar REST API, ${fullUrl}`);
    }

    const res = await fetch(
      fullUrl,
      getRequestHeaders(accessToken || this.accessToken || ''),
    );
    const data = await res.json();
    return camelize(data?.result) as T;
  }

  private async getForProject<T extends {}>(
    url: string,
    projectName: string,
    includeProjectId = true,
  ) {
    const project = await this.getProjectMetadata(projectName);
    let resolvedUrl = url.replace(':projectId', project.id.toString());
    if (includeProjectId) {
      const separator = resolvedUrl.includes('?') ? '&' : '?';
      resolvedUrl = `${resolvedUrl}${separator}project_id=${project.id}`;
    }
    return this.get<T>(resolvedUrl);
  }

  private async getProjectMetadata(name: string) {
    const projectMap = await this.getProjectMap();
    const project = projectMap[name];

    if (!project) {
      throw Error(`Invalid project: '${name}'`);
    }

    return project;
  }

  private async getProjectMap() {
    let projectMap: ProjectMetadataMap | undefined = await this.cache.get(
      CACHE_KEY,
    );
    if (!projectMap) {
      const projects = await this.getAllProjects();
      projectMap = projects.reduce((accum: ProjectMetadataMap, i) => {
        accum[i.name] = { id: i.id, name: i.name };
        return accum;
      }, {});
      this.cache.set(CACHE_KEY, projectMap, { ttl: CACHE_TTL });
    }
    return projectMap;
  }
}

/** @public */
export function getRequestHeaders(token: string) {
  return {
    headers: {
      'X-Rollbar-Access-Token': `${token}`,
    },
  };
}

type ProjectMetadata = {
  name: string;
  id: number;
};

interface ProjectMetadataMap {
  [name: string]: ProjectMetadata;
}
