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
