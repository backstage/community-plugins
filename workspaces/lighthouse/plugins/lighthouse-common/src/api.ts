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

import { Config } from '@backstage/config';

/** @public */
export type LighthouseCategoryId =
  | 'pwa'
  | 'seo'
  | 'performance'
  | 'accessibility'
  | 'best-practices';

/** @public */
export interface LighthouseCategoryAbbr {
  id: LighthouseCategoryId;
  score: number;
  title: string;
}

/** @public */
export interface LASListRequest {
  offset?: number;
  limit?: number;
}

/** @public */
export interface LASListResponse<Item> {
  items: Item[];
  total: number;
  offset: number;
  limit: number;
}

/** @public */
export interface AuditBase {
  id: string;
  url: string;
  timeCreated: string;
}

/** @public */
export interface AuditRunning extends AuditBase {
  status: 'RUNNING';
}

/** @public */
export interface AuditFailed extends AuditBase {
  status: 'FAILED';
  timeCompleted: string;
}

/** @public */
export interface AuditCompleted extends AuditBase {
  status: 'COMPLETED';
  timeCompleted: string;
  report: Object;
  categories: Record<LighthouseCategoryId, LighthouseCategoryAbbr>;
}

/** @public */
export type Audit = AuditRunning | AuditFailed | AuditCompleted;

/** @public */
export interface Website {
  url: string;
  audits: Audit[];
  lastAudit: Audit;
}

/** @public */
export type WebsiteListResponse = LASListResponse<Website>;

/** @public */
export type FormFactor = 'mobile' | 'desktop';

/** @public */
export type LighthouseConfigSettings = {
  // For lighthouse 7+
  formFactor: FormFactor;
  screenEmulation:
    | {
        mobile: boolean;
        width: number;
        height: number;
        deviceScaleFactor: number;
        disabled: boolean;
      }
    | undefined;
  // For lighthouse before 7
  emulatedFormFactor: FormFactor;
};

/** @public */
export interface TriggerAuditPayload {
  url: string;
  options: {
    lighthouseConfig: {
      settings: LighthouseConfigSettings;
    };
  };
}

/** @public */
export class FetchError extends Error {
  get name(): string {
    return this.constructor.name;
  }

  static async forResponse(resp: Response): Promise<FetchError> {
    return new FetchError(
      `Request failed with status code ${
        resp.status
      }.\nReason: ${await resp.text()}`,
    );
  }
}

/** @public */
export type LighthouseApi = {
  url: string;
  getWebsiteList: (listOptions: LASListRequest) => Promise<WebsiteListResponse>;
  getWebsiteForAuditId: (auditId: string) => Promise<Website>;
  triggerAudit: (payload: TriggerAuditPayload) => Promise<Audit>;
  getWebsiteByUrl: (websiteUrl: string) => Promise<Website>;
};

/** @public */
export class LighthouseRestApi implements LighthouseApi {
  static fromConfig(config: Config) {
    return new LighthouseRestApi(config.getString('lighthouse.baseUrl'));
  }

  constructor(public url: string) {}

  private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const resp = await fetch(`${this.url}${input}`, init);
    if (!resp.ok) throw await FetchError.forResponse(resp);
    return await resp.json();
  }

  async getWebsiteList(
    options: LASListRequest = {},
  ): Promise<WebsiteListResponse> {
    const { limit, offset } = options;
    const params = new URLSearchParams();
    if (typeof limit === 'number') params.append('limit', limit.toString());
    if (typeof offset === 'number') params.append('offset', offset.toString());
    return await this.fetch<WebsiteListResponse>(
      `/v1/websites?${params.toString()}`,
    );
  }

  async getWebsiteForAuditId(auditId: string): Promise<Website> {
    return await this.fetch<Website>(
      `/v1/audits/${encodeURIComponent(auditId)}/website`,
    );
  }

  async triggerAudit(payload: TriggerAuditPayload): Promise<Audit> {
    return await this.fetch<Audit>('/v1/audits', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getWebsiteByUrl(websiteUrl: string): Promise<Website> {
    return this.fetch<Website>(
      `/v1/websites/${encodeURIComponent(websiteUrl)}`,
    );
  }
}
