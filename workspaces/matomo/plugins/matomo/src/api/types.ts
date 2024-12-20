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
export type TUserVisitMetrics = {
  columns: Record<keyof TUserVisitMetrics['reportData'], string>;
  reportData: TUserVisitReportData | Record<string, TUserVisitReportData>;
};

export type TUserVisitReportData = {
  nb_uniq_visitors: number;
  nb_visits: number;
  nb_actions: number;
  max_actions: number;
  nb_actions_per_visit: number;
  avg_time_on_site: string;
  bounce_rate: string;
};

export type TGeoMetrics = {
  columns: Record<keyof TGeoMetrics['reportData'], string>;
  reportData: Array<TVisitorReport>;
};

export type TDeviceMetrics = {
  columns: Record<keyof TDeviceMetrics['reportData'], string>;
  reportData: Array<TVisitorReport>;
};

export type TActionMetrics = {
  columns: Record<keyof TActionMetrics['reportData'], string>;
  reportData: {
    nb_pageviews: number;
    nb_uniq_pageviews: number;
    nb_downloads: number;
    nb_uniq_downloads: number;
    nb_outlinks: number;
    nb_uniq_outlinks: number;
    nb_searches: number;
    nb_keywords: number;
  };
};

type TVisitorReport = {
  label: string;
  nb_uniq_visitors: number;
  nb_visits: number;
  nb_actions: number;
  nb_actions_per_visit: number;
  avg_time_on_site: string;
  bounce_rate: string;
  revenue: string;
};

export type TActionByPageURLMetrics = {
  reportData: Array<{
    label: string;
    nb_visits: number;
    nb_hits: number;
    bounce_rate: string;
    avg_time_on_page: string;
    exit_rate: string;
  }>;
};
