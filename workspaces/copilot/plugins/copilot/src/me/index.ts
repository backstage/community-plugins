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

/**
 * Internal implementation of the privacy-scoped, individual ("me") Copilot
 * metrics view. See the plugin README for the privacy design and pluggable
 * user-matching mechanism backing this view.
 */
export { myMetricsApiRef } from './api';
export type { MyMetricsApi, MyDashboardParams } from './api';
export { MyMetricsContent, MyMetricsPage } from './components';
export { copilotMeRouteRef } from './routes';
