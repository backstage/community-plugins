/*
 * Copyright 2025 The Backstage Authors
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

import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import {
  DEFAULT_FILTER_TYPE,
  ReportPortalDocument,
  LaunchDetailsResponse,
  ProjectListResponse,
} from '@backstage-community/plugin-report-portal-common';
import { Readable } from 'stream';
import { ReportPortalIntegrationConfig } from './types';

type ReportPortalCollatorFactoryOptions = {
  logger: LoggerService;
  reportPortalIntegrations?: ReportPortalIntegrationConfig[];
  locationTemplate: string;
};

export class ReportPortalCollatorFactory implements DocumentCollatorFactory {
  private readonly logger: LoggerService;
  private readonly reportPortalIntegrations: ReportPortalIntegrationConfig[];
  private readonly locationTemplate: string;
  type: string = 'report-portal';

  static fromConfig(
    config: RootConfigService,
    options: ReportPortalCollatorFactoryOptions,
  ) {
    const integrations = config
      .getConfigArray('reportPortal.integrations')
      ?.map(data => ({
        host: data.getString('host'),
        baseUrl: data.getString('baseUrl'),
        token: data.getString('token'),
        filterType: data.getString('filterType') ?? DEFAULT_FILTER_TYPE,
      }));

    return new ReportPortalCollatorFactory({
      ...options,
      reportPortalIntegrations: integrations,
    });
  }

  constructor(options: ReportPortalCollatorFactoryOptions) {
    this.reportPortalIntegrations = options.reportPortalIntegrations!;
    this.locationTemplate = options.locationTemplate;
    this.logger = options.logger.child({
      documentType: this.type,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<ReportPortalDocument> {
    for (const reportPortalIntegration of this.reportPortalIntegrations) {
      let hasMorePages = true;
      let page = 1;

      while (hasMorePages) {
        const baseUrl = new URL(
          'v1/project/list',
          reportPortalIntegration.baseUrl,
        );
        baseUrl.searchParams.append(
          'filter.eq.type',
          reportPortalIntegration.filterType,
        );
        baseUrl.searchParams.append('page.page', `${page}`);
        const res = await fetch(baseUrl, {
          headers: { Authorization: reportPortalIntegration.token },
        });
        if (!res.ok) {
          this.logger.error(`Response Error ${res.status} - ${res.statusText}`);
        }
        const projects = (await res.json()) as ProjectListResponse;

        for (const project of projects.content) {
          yield {
            title: project.projectName,
            text: `Launches: ${project.launchesQuantity}`,
            location: `${this.locationTemplate}/instance/project?host=${reportPortalIntegration.host}&project=${project.projectName}`,
            resourceType: 'Project',
            host: reportPortalIntegration.host,
            resourceId: project.id,
          };

          const launchesBaseUrl = new URL(
            `v1/${project.projectName}/launch/latest`,
            reportPortalIntegration.baseUrl,
          );
          launchesBaseUrl.searchParams.append('page.size', '100');
          const resp = await fetch(launchesBaseUrl, {
            headers: { Authorization: reportPortalIntegration.token },
          });
          const launches = (await resp.json()) as LaunchDetailsResponse;
          for (const launch of launches.content) {
            yield {
              title: `${launch.name} #${launch.number}`,
              text: `Launch Status: ${launch.status}`,
              location: `https://${reportPortalIntegration.host}/ui/#${project.projectName}/launches/latest/${launch.id}`,
              resourceType: 'Launch',
              host: reportPortalIntegration.host,
              projectName: project.projectName,
              resourceId: launch.id,
            };
          }
        }

        if (projects.page.number === projects.page.totalPages)
          hasMorePages = false;
        page = projects.page.number + 1;
      }
    }
  }
}
