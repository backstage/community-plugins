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
export type AppenderString = string;

export type UserName = string;
export type Password = string;
export type RawDate = string;

export type KioskMode = string;

export enum HTTP_VERBS {
  DELETE = 'DELETE',
  GET = 'get',
  PATCH = 'patch',
  POST = 'post',
  PUT = 'put',
}

export const PF_THEME_DARK = 'pf-v5-theme-dark';
export const KIALI_THEME = 'kiali-theme';

export const enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
}

export type TargetKind = 'app' | 'service' | 'workload';

export const MILLISECONDS = 1000;

export const UNIT_TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 24 * 3600,
};

export type TimeInMilliseconds = number;
export type TimeInSeconds = number;

export type IntervalInMilliseconds = number;
export type DurationInSeconds = number;

export type BoundsInMilliseconds = {
  from?: TimeInMilliseconds;
  to?: TimeInMilliseconds;
};

// Redux doesn't work well with type composition
export type TimeRange = {
  from?: TimeInMilliseconds;
  to?: TimeInMilliseconds;
  rangeDuration?: DurationInSeconds;
};
