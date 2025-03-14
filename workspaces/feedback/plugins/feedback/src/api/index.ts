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
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { FeedbackType } from '../models/feedback.model';

export const feedbackApiRef = createApiRef<FeedbackAPI>({
  id: 'plugin.feedback.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
  fetchApi: FetchApi;
};

type feedbackResp = {
  data?: FeedbackType;
  message?: string;
  error?: string;
};

type feedbacksResp = {
  data: FeedbackType[];
  count: number;
  currentPage: number;
  pageSize: number;
};

export class FeedbackAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
  }

  private readonly defaultErrorList = [
    'Slow Loading',
    'Not Responsive',
    'Navigation',
    'UI Issues',
    'Other',
  ];
  private readonly defaultExperienceList = [
    'Excellent',
    'Good',
    'Needs Improvement',
    'Other',
  ];

  getErrorList = () =>
    this.configApi.getOptionalStringArray(
      'feedback.customizations.errorList',
    ) ?? this.defaultErrorList;

  getExperienceList = () =>
    this.configApi.getOptionalStringArray(
      'feedback.customizations.experienceList',
    ) ?? this.defaultExperienceList;

  async getAllFeedbacks(
    page: number,
    pageSize: number,
    projectId: string,
    searchText: string,
  ) {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const offset = (page - 1) * pageSize;
    try {
      const resp = await this.fetchApi.fetch(
        `${baseUrl}?query=${searchText}&offset=${offset}&limit=${pageSize}&projectId=${projectId}`,
      );
      const respData: feedbacksResp = await resp.json();
      return respData;
    } catch (error) {
      return { data: [], count: 0, currentPage: page, pageSize: pageSize };
    }
  }

  async getFeedbackById(feedbackId: string): Promise<feedbackResp> {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const resp = await this.fetchApi.fetch(`${baseUrl}/${feedbackId}`);
    const respData: feedbackResp = await resp.json();
    return respData;
  }

  async createFeedback(
    data: Partial<FeedbackType>,
  ): Promise<{ data?: {}; message?: string; error?: string }> {
    try {
      const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
      const resp = await this.fetchApi.fetch(`${baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const respData = await resp.json();
      return respData;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getTicketDetails(
    feedbackId: string,
    ticketUrl: string,
    projectId: string,
  ): Promise<{ status: string; assignee: string; avatarUrls: any }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const ticketId = ticketUrl.split('/').at(-1);
    const resp = await this.fetchApi.fetch(
      `${baseUrl}/${feedbackId}/ticket?ticketId=${ticketId}&projectId=${projectId}`,
      {
        method: 'GET',
      },
    );
    const data = (await resp.json()).data;
    return {
      status: data.status,
      assignee: data.assignee,
      avatarUrls: data.avatarUrls,
    };
  }
}
