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
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  BD_REST_API_RESPONSE,
  BD_PROJECT_DETAIL,
  BD_VERISON_DETAIL,
  BD_VERSIONS_API_RESPONSE,
  BD_PROJECTS_API_RESPONSE,
} from '@backstage-community/plugin-blackduck-common';

/**
 * @public
 */
export class BlackDuckRestApi {
  private _bearer: string;
  private _limit: number;
  public constructor(
    private readonly logger: LoggerService,
    private readonly host: string,
    private readonly token: string,
  ) {
    this._bearer = '';
    this._limit = 1000;
  }

  public async auth() {
    try {
      const auth = await fetch(`${this.host}/tokens/authenticate`, {
        method: 'POST',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.blackducksoftware.user-4+json',
          'Content-Type': 'application/json',
        },
      });
      const token = await auth.json();
      this.logger.info('Auth Successfull');
      this._bearer = token.bearerToken;
      return token.bearerToken;
    } catch (error) {
      throw error;
    }
  }
  public async getProjects(name: string): Promise<BD_REST_API_RESPONSE> {
    const projects = await fetch(
      `${this.host}/projects?limit=999&q=name:${name}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this._bearer}`,
          Accept: 'application/vnd.blackducksoftware.project-detail-4+json',
          'Content-Type': 'application/json',
        },
      },
    );
    this.logger.debug('Retrived Projects!!');
    return projects.json();
  }

  public async getVersions(
    projectUrl: string,
    versionName: string,
  ): Promise<BD_VERSIONS_API_RESPONSE> {
    const versions = await fetch(
      `${projectUrl}/versions?limit=999&q=versionName:${versionName}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this._bearer}`,
          Accept: 'application/vnd.blackducksoftware.project-detail-5+json',
          'Content-Type': 'application/json',
        },
      },
    );
    this.logger.debug('Retrived Versions!!');
    return versions.json();
  }

  public async getProjectVersionDetails(
    projectName: string,
    projectVersion: string,
  ) {
    let projectDetail: BD_PROJECT_DETAIL | any;
    let versionDetail: BD_VERISON_DETAIL | any;
    const projects: BD_PROJECTS_API_RESPONSE = await this.getProjects(
      projectName,
    );
    projects.items.forEach((item: any) => {
      if (item.name === projectName) {
        projectDetail = item;
      }
    });
    if (projectDetail === undefined) {
      this.logger.error('Provide full project name');
    }
    this.logger.debug(`Fetched Project : ${projectName} details`);
    const versions: BD_VERSIONS_API_RESPONSE = await this.getVersions(
      projectDetail._meta.href,
      projectVersion,
    );
    versions.items.forEach((item: any) => {
      if (item.versionName === projectVersion) {
        versionDetail = item;
      }
    });
    if (versionDetail === undefined) {
      this.logger.error('Provide full version name');
    }
    this.logger.debug(
      `Fetched Project : ${projectName}, Version: ${projectVersion} details`,
    );

    return versionDetail;
  }

  public async getVulnerableComponents(
    projectName: string,
    projectVersion: string,
  ) {
    const versionDetail = await this.getProjectVersionDetails(
      projectName,
      projectVersion,
    );
    const vuln_url = `${versionDetail._meta.href}/vulnerable-bom-components?limit=${this._limit}`;
    const vulns: any = await fetch(vuln_url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this._bearer}`,
        Accept: 'application/vnd.blackducksoftware.bill-of-materials-6+json',
        'Content-Type': 'application/json',
      },
    });
    this.logger.debug(
      `Fetched Project : ${projectName}, Version: ${projectVersion} Vulnerable Components`,
    );
    return vulns.json();
  }

  public async getRiskProfile(projectName: string, projectVersion: string) {
    const versionDetail = await this.getProjectVersionDetails(
      projectName,
      projectVersion,
    );
    const risk_profile_url = `${versionDetail._meta.href}/risk-profile`;
    const risk_profile: any = await fetch(risk_profile_url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this._bearer}`,
        // Accept: 'application/vnd.blackducksoftware.component-detail-5+json',
        'Content-Type': 'application/json',
      },
    });
    this.logger.debug(
      `Fetched Project : ${projectName}, Version: ${projectVersion} risk profile`,
    );
    return risk_profile.json();
  }

  public async createProject(
    projectName: string,
    projectVersion?: string,
    phase: string = 'DEVELOPMENT',
    distribution: string = 'INTERNAL',
  ): Promise<any> {
    const create_project_api = `${this.host}/projects`;
    const payload: any = {};
    payload.name = projectName;
    if (projectVersion) {
      payload.versionRequest = {
        versionName: projectVersion,
        phase: phase,
        distribution: distribution,
      };
    }
    this.logger.info(`Project ${JSON.stringify(payload)}`);

    const res = await fetch(create_project_api, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json();
      this.logger.error(`Status Code: ${res.status}`);
      this.logger.error(`Error Message ${JSON.stringify(body.errorMessage)}`);
      throw new Error(`Unable to create project!`);
    }

    return res;
  }
}
