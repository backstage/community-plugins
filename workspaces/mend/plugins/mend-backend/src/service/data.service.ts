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
import { get, post } from '../api';
import { MendAuthSevice } from './auth.service';
import {
  GetOrganizationProjectRequestData,
  GetProjectStatisticsRequestData,
  GetCodeFindingsRequestData,
  GetDependenciesFindingsRequestData,
  GetContainersFindingsRequestData,
  GetOrganizationProjectSuccessResponseData,
  GetProjectStatisticsSuccessResponseData,
  GetCodeFindingSuccessResponseData,
  GetDependenciesFindingSuccessResponseData,
  GetContainersFindingSuccessResponseData,
} from './data.service.types';

export class MendDataService extends MendAuthSevice {
  async getOrganizationProject({
    queryParams,
  }: GetOrganizationProjectRequestData): Promise<GetOrganizationProjectSuccessResponseData> {
    return get(`/orgs/${MendAuthSevice.getOrganizationUuid()}/projects`, {
      params: {
        ...queryParams,
      },
    });
  }

  async getProjectStatistics({
    queryParams,
    bodyParams,
  }: GetProjectStatisticsRequestData): Promise<GetProjectStatisticsSuccessResponseData> {
    return post(
      `/orgs/${MendAuthSevice.getOrganizationUuid()}/projects/summaries`,
      {
        params: {
          ...queryParams,
        },
        body: {
          ...bodyParams,
        },
      },
    );
  }

  async getCodeFinding({
    pathParams,
    queryParams,
  }: GetCodeFindingsRequestData): Promise<GetCodeFindingSuccessResponseData> {
    return get(`/projects/${pathParams.uuid}/code/findings`, {
      params: {
        ...queryParams,
      },
    });
  }

  async getDependenciesFinding({
    pathParams,
    queryParams,
  }: GetDependenciesFindingsRequestData): Promise<GetDependenciesFindingSuccessResponseData> {
    return get(`/projects/${pathParams.uuid}/dependencies/findings/security`, {
      params: {
        ...queryParams,
      },
    });
  }

  async getContainersFinding({
    pathParams,
    queryParams,
  }: GetContainersFindingsRequestData): Promise<GetContainersFindingSuccessResponseData> {
    return get(`/projects/${pathParams.uuid}/images/findings/security`, {
      params: {
        ...queryParams,
      },
    });
  }
}
