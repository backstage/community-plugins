import { DateTime } from 'luxon';
import { WebStorage } from '@backstage/core-app-api';
import {
  DiscoveryApi,
  ErrorApi,
  IdentityApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  CreateAnnouncementRequest,
  CreateCategoryRequest,
  AnnouncementsApi,
} from '@procore-oss/backstage-plugin-announcements-react';
import {
  Announcement,
  AnnouncementsList,
  Category,
} from '@procore-oss/backstage-plugin-announcements-common';

const lastSeenKey = 'user_last_seen_date';

type AnnouncementsClientOptions = {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  errorApi: ErrorApi;
  fetchApi: FetchApi;
};

export class AnnouncementsClient implements AnnouncementsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private readonly webStorage: WebStorage;
  private readonly fetchApi: FetchApi;

  constructor(opts: AnnouncementsClientOptions) {
    this.discoveryApi = opts.discoveryApi;
    this.identityApi = opts.identityApi;
    this.webStorage = new WebStorage('announcements', opts.errorApi);
    this.fetchApi = opts.fetchApi;
  }

  private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');
    const { token } = await this.identityApi.getCredentials();

    const headers: HeadersInit = new Headers(init?.headers);
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return this.fetchApi
      .fetch(`${baseApiUrl}${input}`, {
        ...init,
        headers,
      })
      .then(async response => {
        if (!response.ok) {
          throw await ResponseError.fromResponse(response);
        }

        return response.json() as Promise<T>;
      });
  }

  private async delete(input: string, init?: RequestInit): Promise<void> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');
    const { token } = await this.identityApi.getCredentials();

    const headers: HeadersInit = new Headers(init?.headers);
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return this.fetchApi
      .fetch(`${baseApiUrl}${input}`, {
        ...{ method: 'DELETE' },
        headers,
      })
      .then(async response => {
        if (!response.ok) {
          throw await ResponseError.fromResponse(response);
        }
      });
  }

  async announcements({
    max,
    page,
    category,
  }: {
    max?: number;
    page?: number;
    category?: string;
  }): Promise<AnnouncementsList> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    if (max) {
      params.append('max', max.toString());
    }
    if (page) {
      params.append('page', page.toString());
    }

    return this.fetch<AnnouncementsList>(`/announcements?${params.toString()}`);
  }

  async announcementByID(id: string): Promise<Announcement> {
    return this.fetch<Announcement>(`/announcements/${id}`);
  }

  async createAnnouncement(
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return await this.fetch<Announcement>(`/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return this.fetch<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.delete(`/announcements/${id}`, { method: 'DELETE' });
  }

  async categories(): Promise<Category[]> {
    return this.fetch<Category[]>('/categories');
  }

  async deleteCategory(slug: string): Promise<void> {
    return this.delete(`/categories/${slug}`, { method: 'DELETE' });
  }

  async createCategory(request: CreateCategoryRequest): Promise<void> {
    await this.fetch<Category>(`/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  lastSeenDate(): DateTime {
    const lastSeen = this.webStorage.get<string>(lastSeenKey);
    if (!lastSeen) {
      // magic default date, probably enough in the past to consider every announcement as "not seen"
      return DateTime.fromISO('1990-01-01');
    }

    return DateTime.fromISO(lastSeen);
  }

  markLastSeenDate(date: DateTime): void {
    this.webStorage.set<string>(lastSeenKey, date.toISO()!);
  }
}
