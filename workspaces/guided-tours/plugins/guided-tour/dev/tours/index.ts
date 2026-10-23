/*
 * Copyright 2026 The Backstage Authors
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
import { catalogTour } from './catalogTour';
import { demoLoginTour } from './demoLoginTour';
import { demoRouteTour } from './demoRouteTour';
import { notificationsTour } from './notificationsTour';
import { scaffolderTour } from './scaffolderTour';
import { settingsTour } from './settingsTour';
import { welcomeTour } from './welcomeTour';

/** All tours of the dev app. */
export const devTours = [
  demoLoginTour,
  welcomeTour,
  demoRouteTour,
  catalogTour,
  scaffolderTour,
  notificationsTour,
  settingsTour,
];
